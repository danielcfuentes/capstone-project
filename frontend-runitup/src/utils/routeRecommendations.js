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

