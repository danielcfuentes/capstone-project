import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import axios from "axios";

// Function to initialize the map with given container, center, and zoom level
export const initializeMap = (container, center = [-74.5, 40], zoom = 9) => {
  const map = new mapboxgl.Map({
    container, // HTML container ID for the map
    style: "mapbox://styles/mapbox/streets-v11", // Map style to use
    center, // Initial center coordinates [longitude, latitude]
    zoom, // Initial zoom level
  });

  // Add a custom start flag icon to the map once it loads
  map.on("load", () => {
    const startFlagSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#00FF00" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
        <line x1="4" y1="22" x2="4" y2="15"></line>
      </svg>
    `;

    const startFlagImage = new Image(24, 24);
    startFlagImage.onload = () => {
      map.addImage("start-flag", startFlagImage); // Add the start flag icon to the map
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
    throw new Error("Location not found"); // If no features (locations) are found
  }
  return data.features[0].center; // Return the coordinates of the first feature (location) found
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
    const lat = startLat + (radiusInKm / 111.32) * Math.sin(angle); // Calculate latitude
    const lng =
      startLng +
      (radiusInKm / (111.32 * Math.cos((startLat * Math.PI) / 180))) *
        Math.cos(angle); // Calculate longitude
    coordinates.push([lng, lat]);
  }

  // Add start/end point
  coordinates.unshift([startLng, startLat]);
  coordinates.push([startLng, startLat]);

  return coordinates;
};

// Function to get a route from Mapbox given a set of coordinates
export const getRouteFromMapbox = async (coordinates) => {
  try {
    const chunkedCoordinates = chunkArray(coordinates, 25); // Mapbox has a limit of 25 coordinates per request
    let fullRoute = null;

    // Fetch route in chunks if needed
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

      // Combine chunks into a full route
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
    return null;
  }
};

// Helper function to split an array into chunks of a specified size
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize - 1) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Function to add a route to the map

export const addRouteToMap = (map, routeGeometry, elevationData) => {
  console.log("Adding route to map");
  console.log("Route geometry:", routeGeometry);
  console.log("Elevation data:", elevationData);

  clearRoute(map);

  const minElevation = Math.min(...elevationData.map((d) => d.elevation));
  const maxElevation = Math.max(...elevationData.map((d) => d.elevation));

  console.log("Min elevation:", minElevation);
  console.log("Max elevation:", maxElevation);

  // Create line segments with elevation data
  const features = [];
  for (let i = 0; i < routeGeometry.coordinates.length - 1; i++) {
    features.push({
      type: "Feature",
      properties: {
        elevation:
          (elevationData[i].elevation + elevationData[i + 1].elevation) / 2,
      },
      geometry: {
        type: "LineString",
        coordinates: [
          routeGeometry.coordinates[i],
          routeGeometry.coordinates[i + 1],
        ],
      },
    });
  }

  map.addSource("route", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: features,
    },
  });

  map.addLayer({
    id: "route-line",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": [
        "interpolate",
        ["linear"],
        ["get", "elevation"],
        minElevation,
        "green",
        (minElevation + maxElevation) / 2,
        "yellow",
        maxElevation,
        "red",
      ],
      "line-width": 4,
    },
  });

  console.log("Route layer added with elevation-based gradient");
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

// Function to add a start marker to the map
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

// Function to clear the route from the map
export const clearRoute = (map) => {
  // Remove route-related layers
  if (map.getLayer("route-line")) {
    map.removeLayer("route-line");
  }

  // Remove any other layers that might be using the 'route' source
  map.getStyle().layers.forEach((layer) => {
    if (layer.source === "route") {
      map.removeLayer(layer.id);
    }
  });

  // Remove the route source
  if (map.getSource("route")) {
    map.removeSource("route");
  }

  console.log("Route cleared from map");
};

// Function to remove the current marker and popup from the map
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

// Function to calculate estimated running time based on distance
export const calculateRunningTime = (distanceMiles) => {
  const averagePaceMinPerMile = 9; // Assume 9 minutes per mile for an average runner
  const totalMinutes = distanceMiles * averagePaceMinPerMile;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// Function to get elevation data for a set of coordinates
export const getElevationData = async (coordinates) => {
  console.log("Fetching elevation data for coordinates:", coordinates);
  const chunkSize = 50;
  let elevationData = [];

  for (let i = 0; i < coordinates.length; i += chunkSize) {
    const chunk = coordinates.slice(i, i + chunkSize);
    const query = chunk.map((coord) => coord.join(",")).join(",");

    const response = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${query}.json?layers=contour&access_token=${mapboxgl.accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch elevation data: ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure we have elevation data for each coordinate
    chunk.forEach((coord, index) => {
      const feature = data.features[index];
      elevationData.push({
        coordinate: coord,
        elevation: feature ? feature.properties.ele : 0, // Use 0 if no elevation data
      });
    });
  }

  // Interpolate missing elevation data
  for (let i = 0; i < elevationData.length; i++) {
    if (
      elevationData[i].elevation === 0 &&
      i > 0 &&
      i < elevationData.length - 1
    ) {
      const prev = elevationData[i - 1].elevation;
      const next = elevationData[i + 1].elevation;
      elevationData[i].elevation = (prev + next) / 2;
    }
  }

  // Calculate total elevation gain and loss
  let elevationGain = 0;
  let elevationLoss = 0;
  let prevElevation = elevationData[0].elevation;

  for (let i = 1; i < elevationData.length; i++) {
    const diff = elevationData[i].elevation - prevElevation;
    if (diff > 0) {
      elevationGain += diff;
    } else {
      elevationLoss += Math.abs(diff);
    }
    prevElevation = elevationData[i].elevation;
  }

  const result = {
    elevationProfile: elevationData,
    gain: Math.round(elevationGain),
    loss: Math.round(elevationLoss),
  };

  console.log("Elevation data result:", result);
  return result;
};

// Function to calculate the distance of a route
export const calculateRouteDistance = (route) => {
  return (route.distance / 1609.34).toFixed(2); // Convert meters to miles and round to 2 decimal places
};

// Function to generate a route within a desired distance
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

  // Binary search to find the best route within the desired distance
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
      return {
        route: bestRoute,
        actualDistance: bestDistance,
      };
    }

    if (actualDistance > desiredDistanceMiles) {
      maxRadius = radius;
    } else {
      minRadius = radius;
    }
  }

  // If we couldn't get within tolerance, return the best route we found
  return {
    route: bestRoute,
    actualDistance: bestDistance,
  };
};

// Function to calculate personalized running time based on user profile
export const calculatePersonalizedRunningTime = (
  distanceMiles,
  elevationGain,
  userProfile
) => {
  // Base pace in minutes per mile for an intermediate recreational runner
  let basePace = 10;

  // Adjust for age (younger runners tend to be faster)
  if (userProfile.age < 30) {
    basePace -= (30 - userProfile.age) * 0.05;
  } else if (userProfile.age > 40) {
    basePace += (userProfile.age - 40) * 0.05;
  }

  // Adjust for fitness level
  const fitnessAdjustment = {
    beginner: 2,
    intermediate: 0,
    advanced: -1,
    expert: -2,
  };
  basePace += fitnessAdjustment[userProfile.fitnessLevel] || 0;

  // Adjust for running experience
  const experienceAdjustment = {
    beginner: 1,
    recreational: 0.5,
    intermediate: 0,
    advanced: -0.5,
    expert: -1,
  };
  basePace += experienceAdjustment[userProfile.runningExperience] || 0;

  // Adjust for BMI
  const heightInches = userProfile.height * 12; // Convert feet to inches
  const bmi = (userProfile.weight / (heightInches * heightInches)) * 703;
  if (bmi > 25) {
    basePace += (bmi - 25) * 0.1;
  }

  // Adjust for health conditions
  if (
    userProfile.healthConditions &&
    userProfile.healthConditions.includes("Knee Issues")
  ) {
    basePace += 1; // Add 1 minute per mile for knee issues
  }

  // Adjust for elevation gain (add 30 seconds per 100ft of elevation gain per mile)
  const elevationAdjustment = (elevationGain / 100) * 0.5;
  basePace += elevationAdjustment / distanceMiles;

  // Calculate total time
  const totalMinutes = basePace * distanceMiles;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// Function to get detailed terrain information for a set of coordinates
export const getDetailedTerrainInfo = async (coordinates) => {
  const terrainTypes = {
    "Paved Road": 0,
    "Urban Path": 0,
    "Gravel/Dirt Path": 0,
    "Nature Trail": 0,
    "Mixed Terrain": 0,
  };
  let totalDistance = 0;

  // Sample every 10th point to reduce API calls
  for (let i = 0; i < coordinates.length - 1; i += 10) {
    const [startLon, startLat] = coordinates[i];
    const [endLon, endLat] =
      coordinates[Math.min(i + 10, coordinates.length - 1)];
    const segmentLength = turf.distance(
      turf.point([startLon, startLat]),
      turf.point([endLon, endLat]),
      { units: "kilometers" }
    );
    totalDistance += segmentLength;

    const [lon, lat] = turf.midpoint([startLon, startLat], [endLon, endLat])
      .geometry.coordinates;

    try {
      const response = await axios.get(
        `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lon},${lat}.json?layers=road&access_token=${mapboxgl.accessToken}`
      );

      const feature = response.data.features[0];
      if (feature && feature.properties) {
        if (
          feature.properties.class === "path" ||
          feature.properties.class === "footway"
        ) {
          terrainTypes["Nature Trail"] += segmentLength;
        } else if (
          feature.properties.class === "minor" ||
          feature.properties.class === "service"
        ) {
          terrainTypes["Urban Path"] += segmentLength;
        } else if (feature.properties.class === "track") {
          terrainTypes["Gravel/Dirt Path"] += segmentLength;
        } else if (
          feature.properties.class === "primary" ||
          feature.properties.class === "secondary" ||
          feature.properties.class === "tertiary"
        ) {
          terrainTypes["Paved Road"] += segmentLength;
        } else {
          terrainTypes["Mixed Terrain"] += segmentLength;
        }
      } else {
        terrainTypes["Mixed Terrain"] += segmentLength;
      }
    } catch (error) {
      terrainTypes["Mixed Terrain"] += segmentLength;
    }
  }

  // Convert distances to percentages
  Object.keys(terrainTypes).forEach((key) => {
    terrainTypes[key] = ((terrainTypes[key] / totalDistance) * 100).toFixed(2);
  });

  return terrainTypes;
};

// Function to get basic route information including distance and elevation data
export const getBasicRouteInfo = async (route) => {
  const distance = calculateRouteDistance(route);
  const elevationData = await getElevationData(route.geometry.coordinates);
  return { distance, elevationData };
};

let mileMarkers = []; // Array to store mile marker

export const addMileMarkers = (map, route) => {
  // Clear existing mile markers
  clearMileMarkers();

  const routeLine = turf.lineString(route.geometry.coordinates);
  const totalDistance = turf.length(routeLine, { units: "miles" });

  for (let mile = 1; mile <= Math.floor(totalDistance); mile++) {
    const point = turf.along(routeLine, mile, { units: "miles" });
    const [lng, lat] = point.geometry.coordinates;

    // Create marker element
    const el = document.createElement("div");
    el.className = "mile-marker";
    el.innerHTML = `<span>${mile}</span>`;

    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`Mile ${mile}`);

    // Add marker to map
    const marker = new mapboxgl.Marker(el)
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    // Store the marker
    mileMarkers.push(marker);
  }
};

export const clearMileMarkers = () => {
  mileMarkers.forEach((marker) => marker.remove());
  mileMarkers = [];
};

//colors for elveation

const getColorForElevation = (elevation, minElevation, maxElevation) => {
  const normalizedElevation =
    (elevation - minElevation) / (maxElevation - minElevation);
  // Use a gradient from green to yellow to red
  if (normalizedElevation < 0.5) {
    return `rgb(${Math.floor(normalizedElevation * 2 * 255)}, 255, 0)`;
  } else {
    return `rgb(255, ${Math.floor((1 - normalizedElevation) * 2 * 255)}, 0)`;
  }
};

export const addElevationLegend = (map) => {
  const legend = document.createElement("div");
  legend.className = "elevation-legend";
  legend.style.position = "absolute";
  legend.style.bottom = "30px";
  legend.style.right = "10px";
  legend.style.background = "white";
  legend.style.padding = "10px";
  legend.style.borderRadius = "5px";
  legend.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";

  const title = document.createElement("h4");
  title.textContent = "Elevation";
  title.style.marginBottom = "5px";
  legend.appendChild(title);

  const gradientBar = document.createElement("div");
  gradientBar.style.width = "20px";
  gradientBar.style.height = "100px";
  gradientBar.style.background = "linear-gradient(to top, green, yellow, red)";
  gradientBar.style.marginRight = "10px";
  legend.appendChild(gradientBar);

  const labels = document.createElement("div");
  labels.style.display = "flex";
  labels.style.flexDirection = "column";
  labels.style.justifyContent = "space-between";
  labels.style.height = "100px";

  const highLabel = document.createElement("div");
  highLabel.textContent = "High";
  const lowLabel = document.createElement("div");
  lowLabel.textContent = "Low";

  labels.appendChild(highLabel);
  labels.appendChild(lowLabel);
  legend.appendChild(labels);

  map.getContainer().appendChild(legend);
};
