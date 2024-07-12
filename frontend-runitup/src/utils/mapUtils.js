import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

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

export const generateCircularRouteCoordinates = (
  startLat,
  startLng,
  radiusInKm
) => {
  const numPoints = 16; // Number of points in the circle
  let coordinates = [];

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lat = startLat + (radiusInKm / 111.32) * Math.sin(angle);
    const lng =
      startLng +
      (radiusInKm / (111.32 * Math.cos((startLat * Math.PI) / 180))) *
        Math.cos(angle);
    coordinates.push([lng, lat]);
  }

  // Add start/end point
  coordinates.unshift([startLng, startLat]);
  coordinates.push([startLng, startLat]);

  return coordinates;
};

export const getRouteFromMapbox = async (coordinates) => {
  try {
    const chunkedCoordinates = chunkArray(coordinates, 25); // Mapbox has a limit of 25 coordinates per request
    let fullRoute = null;

    for (const chunk of chunkedCoordinates) {
      const coordinateString = chunk.map((coord) => coord.join(",")).join(";");
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinateString}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}&annotations=distance,duration,speed`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch route from Mapbox: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error("No routes found");
      }

      if (!fullRoute) {
        fullRoute = data.routes[0];
      } else {
        fullRoute.geometry.coordinates = fullRoute.geometry.coordinates.concat(
          data.routes[0].geometry.coordinates.slice(1)
        );
        fullRoute.distance += data.routes[0].distance;
        fullRoute.duration += data.routes[0].duration;
        fullRoute.legs = fullRoute.legs.concat(data.routes[0].legs);
      }
    }

    return fullRoute;
  } catch (error) {
    console.error("Error fetching route from Mapbox:", error);
    throw error;
  }
};

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize - 1) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
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

export const calculateRunningTime = (distanceMiles) => {
  const averagePaceMinPerMile = 9; // Assume 9 minutes per mile for an average runner
  const totalMinutes = distanceMiles * averagePaceMinPerMile;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export const extractDirections = (legs) => {
  if (!legs || legs.length === 0) return [];

  return legs.flatMap((leg) =>
    leg.steps.map((step) => ({
      instruction: step.maneuver.instruction,
      distance: (step.distance * 0.000621371).toFixed(2), // Convert meters to miles
    }))
  );
};

export const estimateElevationChange = (route) => {
  // Since we don't have accurate elevation data, we'll provide a rough estimate
  const distanceInKm = route.distance / 1000;
  const estimatedGainPerKm = 10; // Assume an average of 10m elevation gain per km

  const gain = Math.round(distanceInKm * estimatedGainPerKm);
  const loss = gain; // Assume the route ends where it starts, so loss should equal gain

  return { gain, loss };
};

export const calculateRouteDistance = (route) => {
  return (route.distance / 1609.34).toFixed(2); // Convert meters to miles and round to 2 decimal places
};

export const generateRouteWithinDistance = async (
  startLat,
  startLng,
  desiredDistanceMiles,
  tolerance = 0.1
) => {
  const desiredDistanceKm = desiredDistanceMiles * 1.60934;
  let minRadius = desiredDistanceKm / (4 * Math.PI);
  let maxRadius = desiredDistanceKm / Math.PI;
  let bestRoute = null;
  let bestDistance = Infinity;
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    const radius = (minRadius + maxRadius) / 2;
    const coordinates = generateCircularRouteCoordinates(
      startLat,
      startLng,
      radius
    );
    const route = await getRouteFromMapbox(coordinates);
    const actualDistance = parseFloat(calculateRouteDistance(route));

    if (
      Math.abs(actualDistance - desiredDistanceMiles) <
      Math.abs(bestDistance - desiredDistanceMiles)
    ) {
      bestRoute = route;
      bestDistance = actualDistance;
    }

    if (Math.abs(actualDistance - desiredDistanceMiles) <= tolerance) {
      return { route: bestRoute, actualDistance: bestDistance };
    }

    if (actualDistance > desiredDistanceMiles) {
      maxRadius = radius;
    } else {
      minRadius = radius;
    }
  }

  // If we couldn't get within tolerance, return the best route we found
  return { route: bestRoute, actualDistance: bestDistance };
};
