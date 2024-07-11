import mapboxgl from "mapbox-gl";

// Function to initialize the map with given container, center, and zoom level
export const initializeMap = (container, center = [-74.5, 40], zoom = 9) => {
  const map = new mapboxgl.Map({
    container,
    style: "mapbox://styles/mapbox/streets-v11",
    center,
    zoom,
  });

  map.on("load", () => {
    // Add start flag icon
    const startFlagSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#00FF00" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15"></line>
      </svg>
    `;

    const startFlagImage = new Image(24, 24);
    startFlagImage.onload = () => {
      map.addImage("start-flag", startFlagImage);
    };
    startFlagImage.src =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(startFlagSvg);
  });

  return map;
};

// Function to geocode a location (convert location name to geographical coordinates)
export const geocodeLocation = async (location) => {
  // Fetch geocoding data from Mapbox API
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      location
    )}.json?access_token=${mapboxgl.accessToken}`
  );
  const data = await response.json();
  if (data.features.length === 0) {
    // If no features (locations) are found
    throw new Error("Location not found");
  }
  return data.features[0].center; // Return the coordinates of the first feature  (location) found
};

// Function to generate a circular route given a start point and distance
export const generateCircularRoute = (startLat, startLng, distanceMiles) => {
  const earthRadiusKm = 6371; // Radius of the Earth in kilometers
  const distanceKm = distanceMiles * 1.60934; // Convert miles to kilometers
  const radiusKm = distanceKm / (2 * Math.PI); // Calculate radius of the circle

  const coordinates = []; // Array to store route coordinates

  // Generate coordinates for the circular route
  for (let i = 0; i <= 360; i += 45) {
    const angle = i * (Math.PI / 180); // Convert angle to radians
    const lat =
      startLat + (radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.sin(angle); // Calculate latitude
    const lng =
      startLng +
      ((radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.cos(angle)) /
        Math.cos((startLat * Math.PI) / 180); // Calculate longitude
    coordinates.push(`${lng},${lat}`); // Add coordinate to the array
  }

  coordinates.push(`${startLng},${startLat}`); // Close the loop by adding the start point at the end
  return coordinates; // Return the array of coordinates
};

// Function to get a route from Mapbox API given a set of coordinates
export const getRouteFromMapbox = async (coordinates) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates.join(
        ";"
      )}?geometries=geojson&access_token=${mapboxgl.accessToken}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch route from Mapbox");
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No routes found");
    }

    return data;
  } catch (error) {
    console.error("Error fetching route from Mapbox:", error);
    throw error;
  }
};

// Function to add a route to the map
export const addRouteToMap = (map, routeGeometry) => {
  if (map.getSource("route")) {
    map.removeLayer("route");
    map.removeSource("route");
  }

  map.addSource("route", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: routeGeometry,
    },
  });

  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#3887be",
      "line-width": 5,
      "line-opacity": 0.75,
    },
  });
};

// Function to fit the map view to the given route coordinates
export const fitMapToRouteWithStart = (
  map,
  routeCoordinates,
  startCoordinates
) => {
  const bounds = routeCoordinates.reduce((bounds, coord) => {
    return bounds.extend(coord);
  }, new mapboxgl.LngLatBounds(startCoordinates, startCoordinates));

  map.fitBounds(bounds, { padding: 50 });
};

let currentMarker = null;
let currentPopup = null;

export const addStartMarker = (map, coordinates, locationName) => {
  // Remove existing marker and popup
  removeCurrentMarker();

  // Add new marker
  currentMarker = new mapboxgl.Marker({
    color: "#00FF00",
    scale: 1.2,
  })
    .setLngLat(coordinates)
    .addTo(map);

  // Add new popup
  currentPopup = new mapboxgl.Popup({
    offset: 25,
    closeButton: false,
    closeOnClick: false,
  })
    .setLngLat(coordinates)
    .setHTML(`<h3>Start: ${locationName}</h3>`)
    .addTo(map);

  return currentMarker;
};

export const clearRoute = (map) => {
  if (map.getSource("route")) {
    map.removeLayer("route");
    map.removeSource("route");
  }
};

export const removeCurrentMarker = () => {
  if (currentMarker) {
    currentMarker.remove();
    currentMarker = null;
  }
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
};

//route info

export const extractRouteInfo = (route) => {
  const distance = (route.distance * 0.000621371).toFixed(2); // Convert meters to miles
  const duration = formatDuration(route.duration);
  const elevationGain = calculateElevationGain(route.geometry.coordinates);
  const elevationLoss = calculateElevationLoss(route.geometry.coordinates);
  const terrain = determineTerrain(elevationGain, distance);
  const directions = extractDirections(route.legs[0].steps);

  return {
    distance,
    duration,
    elevationGain,
    elevationLoss,
    terrain,
    directions,
  };
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const calculateElevationGain = (coordinates) => {
  let gain = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const elevationDiff = coordinates[i][2] - coordinates[i - 1][2];
    if (elevationDiff > 0) gain += elevationDiff;
  }
  return Math.round(gain * 3.28084); // Convert meters to feet
};

const calculateElevationLoss = (coordinates) => {
  let loss = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const elevationDiff = coordinates[i - 1][2] - coordinates[i][2];
    if (elevationDiff > 0) loss += elevationDiff;
  }
  return Math.round(loss * 3.28084); // Convert meters to feet
};

const determineTerrain = (elevationGain, distance) => {
  const gainPerMile = elevationGain / distance;
  if (gainPerMile < 50) return "Flat";
  if (gainPerMile < 150) return "Rolling Hills";
  if (gainPerMile < 300) return "Hilly";
  return "Mountainous";
};

const extractDirections = (steps) => {
  return steps.map((step) => step.maneuver.instruction);
};
