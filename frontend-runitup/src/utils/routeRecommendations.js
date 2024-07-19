import { getHeaders } from "./apiConfig";
import {
  calculateRouteDistance,
  getElevationData,
  getDetailedTerrainInfo,
  generateCircularRouteCoordinates,
  getRouteFromMapbox,
} from "./mapUtils";

// Fetches the user's past running activities from the backend
async function getUserPastRoutes(userId) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_POST_ADDRESS}/user-activities/${userId}`,
      {
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch user activities");
    const activities = await response.json();

    // Get the most recent start location
    let lastStartLocation = null;
    if (activities.length > 0) {
      const mostRecentActivity = activities[0];
      lastStartLocation = {
        latitude: mostRecentActivity.startLatitude,
        longitude: mostRecentActivity.startLongitude,
      };
    }

    return {
      routes: activities,
      lastStartLocation,
    };
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return { routes: [], lastStartLocation: null };
  }
}

// Analyzes past routes to extract useful metrics
function analyzePastRoutes(routes) {
  if (!routes || routes.length === 0) {
    return {
      totalDistance: 0,
      totalElevationGain: 0,
      totalDuration: 0,
      preferredTerrains: {},
      avgPace: 0,
      count: 0
    };
  }

  const analysis = routes.reduce((acc, route) => {
    acc.totalDistance += route.distance || 0;
    acc.totalElevationGain += route.elevationGain || 0;
    acc.totalDuration += route.duration || 0;
    if (route.terrain) {
      route.terrain.forEach(t => {
        acc.preferredTerrains[t] = (acc.preferredTerrains[t] || 0) + 1;
      });
    }
    acc.count += 1;
    return acc;
  }, { totalDistance: 0, totalElevationGain: 0, totalDuration: 0, preferredTerrains: {}, count: 0 });

  // Calculate average pace
  analysis.avgPace = analysis.totalDuration / analysis.totalDistance / 60;
  return analysis;
}

// Main function to generate route recommendations
export async function getRouteRecommendations(userId, userProfile) {
  try {
    const { routes, lastStartLocation } = await getUserPastRoutes(userId);
    const routeAnalysis = analyzePastRoutes(routes);

    const recommendations = [
      await generateSimilarRoute(routeAnalysis, userProfile, lastStartLocation),
      await generateChallengeRoute(routeAnalysis, userProfile, lastStartLocation),
      await generateExplorationRoute(routeAnalysis, userProfile, lastStartLocation),
      await generateIntervalTrainingRoute(routeAnalysis, userProfile, lastStartLocation),
      await generateRecoveryRoute(routeAnalysis, userProfile, lastStartLocation)
    ].filter(Boolean); // Remove any null recommendations

    return recommendations;
  } catch (error) {
    console.error('Error generating route recommendations:', error);
    return [];
  }
}

// Generates a route similar to the user's past runs
async function generateSimilarRoute(routeAnalysis, userProfile, lastStartLocation) {
  const avgDistance = routeAnalysis.count > 0 ? routeAnalysis.totalDistance / routeAnalysis.count : 3;
  const avgElevationGain = routeAnalysis.count > 0 ? routeAnalysis.totalElevationGain / routeAnalysis.count : 50;

  // Find the most preferred terrain
  const preferredTerrain = Object.entries(routeAnalysis.preferredTerrains).sort((a, b) => b[1] - a[1])[0]?.[0] || 'road';

  return {
    type: 'similar',
    distance: avgDistance,
    elevationGain: avgElevationGain,
    terrain: preferredTerrain,
    estimatedPace: routeAnalysis.avgPace,
    description: 'A route similar to your usual runs',
    startLocation: lastStartLocation
  };
}

// Generates a more challenging route
async function generateChallengeRoute(routeAnalysis, userProfile, lastStartLocation) {
  const avgDistance = routeAnalysis.count > 0 ? routeAnalysis.totalDistance / routeAnalysis.count : 3;
  const avgElevationGain = routeAnalysis.count > 0 ? routeAnalysis.totalElevationGain / routeAnalysis.count : 50;

  const challengeMultiplier = calculateChallengeMultiplier(userProfile);

  return {
    type: 'challenge',
    distance: avgDistance * challengeMultiplier,
    elevationGain: avgElevationGain * challengeMultiplier,
    terrain: 'mixed',
    estimatedPace: routeAnalysis.avgPace * 0.95, // Slightly faster pace
    description: 'A more challenging route to push your limits',
    startLocation: lastStartLocation
  };
}

// Generates a route for exploration
async function generateExplorationRoute(routeAnalysis, userProfile, lastStartLocation) {
  const avgDistance = routeAnalysis.count > 0 ? routeAnalysis.totalDistance / routeAnalysis.count : 3;

  const newTerrain = selectNewTerrain(routeAnalysis.preferredTerrains);

  return {
    type: 'exploration',
    distance: avgDistance,
    elevationGain: null, // To be determined by the new area
    terrain: newTerrain,
    estimatedPace: routeAnalysis.avgPace * 1.05, // Slightly slower pace for new terrain
    description: 'An exciting new route to explore different areas and terrains',
    startLocation: lastStartLocation
  };
}

// Generates an interval training route
async function generateIntervalTrainingRoute(routeAnalysis, userProfile, lastStartLocation) {
  const intervalDistance = Math.min(routeAnalysis.totalDistance / routeAnalysis.count, 5); // Cap at 5 miles

  return {
    type: 'interval',
    distance: intervalDistance,
    elevationGain: null,
    terrain: 'flat',
    estimatedPace: routeAnalysis.avgPace * 0.9, // Faster pace for intervals
    description: 'An interval training route to improve your speed',
    startLocation: lastStartLocation,
    intervals: generateIntervals(intervalDistance, userProfile.fitnessLevel)
  };
}

// Generates a recovery route
async function generateRecoveryRoute(routeAnalysis, userProfile, lastStartLocation) {
  const recoveryDistance = Math.min(routeAnalysis.totalDistance / routeAnalysis.count * 0.7, 3); // 70% of avg distance, capped at 3 miles

  return {
    type: 'recovery',
    distance: recoveryDistance,
    elevationGain: 0,
    terrain: 'flat',
    estimatedPace: routeAnalysis.avgPace * 1.2, // Slower pace for recovery
    description: 'An easy recovery route to help you rest and rejuvenate',
    startLocation: lastStartLocation
  };
}

// Calculates the challenge multiplier based on user's fitness level
function calculateChallengeMultiplier(userProfile) {
  const baseMultiplier = 1.2;
  const fitnessLevelAdjustment = {
    beginner: -0.1,
    intermediate: 0,
    advanced: 0.1
  };
  return baseMultiplier + (fitnessLevelAdjustment[userProfile.fitnessLevel] || 0);
}

// Selects a new terrain type for exploration
function selectNewTerrain(preferredTerrains) {
  const allTerrains = ['road', 'trail', 'track', 'mixed'];
  const sortedTerrains = Object.entries(preferredTerrains)
    .sort((a, b) => b[1] - a[1])
    .map(([terrain]) => terrain);

  return allTerrains.find(t => !sortedTerrains.includes(t)) || 'mixed';
}

// Generates interval segments for interval training
function generateIntervals(distance, fitnessLevel) {
  const intervalCount = Math.floor(distance / 0.25); // Quarter-mile intervals
  const restRatio = fitnessLevel === 'beginner' ? 2 : fitnessLevel === 'intermediate' ? 1 : 0.5;

  return Array(intervalCount).fill().map(() => ({
    distance: 0.25,
    type: 'sprint',
    restDistance: 0.25 * restRatio
  }));
}

// Applies a selected recommendation to generate an actual route
export async function applyRecommendation(recommendation) {
  try {
    if (!recommendation.startLocation) {
      throw new Error("Start location is not available");
    }

    const radius = recommendation.distance / (2 * Math.PI);
    const coordinates = generateCircularRouteCoordinates(
      recommendation.startLocation.latitude,
      recommendation.startLocation.longitude,
      radius
    );

    const route = await getRouteFromMapbox(coordinates);

    if (!route) {
      throw new Error("Failed to generate route");
    }

    const elevationData = await getElevationData(route.geometry.coordinates);
    const terrainInfo = await getDetailedTerrainInfo(route.geometry.coordinates);

    return {
      geometry: route.geometry,
      distance: calculateRouteDistance(route),
      duration: route.duration,
      elevationGain: elevationData.gain,
      elevationLoss: elevationData.loss,
      terrain: terrainInfo,
      startLocation: recommendation.startLocation,
      type: recommendation.type,
      intervals: recommendation.intervals
    };
  } catch (error) {
    console.error("Error applying recommendation:", error);
    throw error;
  }
}
