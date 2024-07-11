import mapboxgl from "mapbox-gl";

// Function to initialize the map with given container, center, and zoom level
export const initializeMap = (container, center = [-74.5, 40], zoom = 9) => {
  return new mapboxgl.Map({
    container, 
    style: "mapbox://styles/mapbox/streets-v11",
    center,
    zoom,
  });
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

  // Fetch route data from Mapbox Directions API
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates.join(
      ";"
    )}?geometries=geojson&access_token=${mapboxgl.accessToken}`
  );
  const data = await response.json();
  if (data.routes.length === 0) {
    // If no routes are found
    throw new Error("Unable to generate a route"); // Throw an error
  }
  return data.routes[0].geometry; // Return the geometry of the first route found
};

// Function to add a route to the map
export const addRouteToMap = (map, routeGeometry) => {
  // Remove existing route layer and source if they exist
  if (map.getSource("route")) {
    map.removeLayer("route");
    map.removeSource("route");
  }

  // Add new source for the route
  map.addSource("route", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: routeGeometry, // GeoJSON data for the route
    },
  });

  // Add new layer to display the route
  map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "red",
      "line-width": 8,
    },
  });
};

// Function to fit the map view to the given route coordinates
export const fitMapToRoute = (map, coordinates) => {
  // Create a bounding box to fit all the coordinates
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord); // Extend the bounds to include each coordinate
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])); // Initialize bounds with the first coordinate

  map.fitBounds(bounds, { padding: 50 }); // Adjust the map view to fit the bounds with padding
};
