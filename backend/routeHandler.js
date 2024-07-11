const express = require("express");
const axios = require("axios");
const router = express.Router();

const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

const geocodeLocation = async (location) => {
  const response = await axios.get(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      location
    )}.json`,
    {
      params: { access_token: MAPBOX_ACCESS_TOKEN },
    }
  );
  if (response.data.features.length === 0) {
    throw new Error("Location not found");
  }
  return response.data.features[0].center;
};

const generateCircularRoute = (startLat, startLng, distanceMiles) => {
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
    coordinates.push([lng, lat]);
  }

  coordinates.push([startLng, startLat]);
  return coordinates;
};

const getRouteFromMapbox = async (coordinates) => {
  const coordString = coordinates.map((coord) => coord.join(",")).join(";");
  const response = await axios.get(
    `https://api.mapbox.com/directions/v5/mapbox/walking/${coordString}`,
    {
      params: {
        geometries: "geojson",
        access_token: MAPBOX_ACCESS_TOKEN,
      },
    }
  );
  if (response.data.routes.length === 0) {
    throw new Error("Unable to generate a route");
  }
  return response.data.routes[0].geometry;
};

router.post("/generate", async (req, res) => {
  try {
    const { startLocation, distance } = req.body;

    const [startLng, startLat] = await geocodeLocation(startLocation);
    const coordinates = generateCircularRoute(startLat, startLng, distance);
    const routeGeometry = await getRouteFromMapbox(coordinates);

    res.json({ routeGeometry });
  } catch (error) {
    console.error("Error generating route:", error);
    res
      .status(500)
      .json({
        error: error.message || "An error occurred while generating the route",
      });
  }
});

module.exports = router;
