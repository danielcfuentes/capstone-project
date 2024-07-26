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


function createGraph(osmData) {
  const graph = new Map();

  osmData.elements.forEach((element) => {
    if (element.type === "node") {
      graph.set(element.id, {
        id: element.id,
        lat: element.lat,
        lon: element.lon,
        connections: new Set(),
      });
    }
  });

  osmData.elements.forEach((element) => {
    if (
      element.type === "way" &&
      element.tags &&
      (element.tags.highway || element.tags.footway)
    ) {
      for (let i = 0; i < element.nodes.length - 1; i++) {
        const node1 = graph.get(element.nodes[i]);
        const node2 = graph.get(element.nodes[i + 1]);

        if (node1 && node2) {
          node1.connections.add(node2.id);
          node2.connections.add(node1.id);
        }
      }
    }
  });

  return graph;
}

function findClosestNode(graph, lat, lng) {
  let closestNode = null;
  let minDistance = Infinity;

  for (const node of graph.values()) {
    const distance = turf.distance(
      turf.point([lng, lat]),
      turf.point([node.lon, node.lat]),
      { units: "kilometers" }
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node;
    }
  }

  return closestNode;
}
