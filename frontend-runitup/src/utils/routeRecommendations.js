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
