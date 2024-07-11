import mapboxgl from "mapbox-gl";

export const initializeMap = (container, center = [-74.5, 40], zoom = 9) => {
  return new mapboxgl.Map({
    container,
    style: "mapbox://styles/mapbox/streets-v11",
    center,
    zoom,
  });
};

export const geocodeLocation = async (location) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      location
    )}.json?access_token=${mapboxgl.accessToken}`
  );
  const data = await response.json();
  if (data.features.length === 0) {
    throw new Error("Location not found");
  }
  return data.features[0].center;
};

export const generateCircularRoute = (startLat, startLng, distanceMiles) => {
  const earthRadiusKm = 6371;
  const distanceKm = distanceMiles * 1.60934;
  const radiusKm = distanceKm / (2 * Math.PI);

  const coordinates = [];
  for (let i = 0; i <= 360; i += 45) {
    const angle = i * (Math.PI / 180);
    const lat =
      startLat + (radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.sin(angle);
    const lng =
      startLng +
      ((radiusKm / earthRadiusKm) * (180 / Math.PI) * Math.cos(angle)) /
        Math.cos((startLat * Math.PI) / 180);
    coordinates.push(`${lng},${lat}`);
  }

  coordinates.push(`${startLng},${startLat}`);
  return coordinates;
};

export const getRouteFromMapbox = async (coordinates) => {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates.join(
      ";"
    )}?geometries=geojson&access_token=${mapboxgl.accessToken}`
  );
  const data = await response.json();
  if (data.routes.length === 0) {
    throw new Error("Unable to generate a route");
  }
  return data.routes[0].geometry;
};

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
      "line-color": "#888",
      "line-width": 8,
    },
  });
};

export const fitMapToRoute = (map, coordinates) => {
  const bounds = coordinates.reduce((bounds, coord) => {
    return bounds.extend(coord);
  }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

  map.fitBounds(bounds, { padding: 50 });
};
