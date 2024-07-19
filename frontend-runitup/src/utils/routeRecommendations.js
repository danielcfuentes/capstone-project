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
