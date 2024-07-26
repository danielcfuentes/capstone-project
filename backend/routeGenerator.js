const turf = require("@turf/turf");
const axios = require("axios");

async function fetchRoadNetwork(startLat, startLng, radiusKm) {
  const query = `
    [out:json];
    (
      way["highway"](around:${radiusKm * 1000},${startLat},${startLng});
      >;
    );
    out body;
  `;

  const response = await axios.post(
    "https://overpass-api.de/api/interpreter",
    query
  );
  return response.data;
}
