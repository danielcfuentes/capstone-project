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
