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

function generateCircularRoute(
  graph,
  startNodeId,
  desiredDistanceKm,
  tolerance = 0.1
) {
  const visited = new Set();
  const route = [startNodeId];
  let currentNodeId = startNodeId;
  let totalDistance = 0;

  while (totalDistance < desiredDistanceKm) {
    visited.add(currentNodeId);
    const currentNode = graph.get(currentNodeId);

    if (!currentNode || currentNode.connections.size === 0) {
      break;
    }

    let nextNodeId = null;
    let minDistanceDiff = Infinity;

    for (const neighborId of currentNode.connections) {
      if (!visited.has(neighborId)) {
        const neighborNode = graph.get(neighborId);
        const distanceToNeighbor = calculateDistance(currentNode, neighborNode);
        const newTotalDistance = totalDistance + distanceToNeighbor;
        const distanceDiff = Math.abs(desiredDistanceKm - newTotalDistance);

        if (distanceDiff < minDistanceDiff) {
          nextNodeId = neighborId;
          minDistanceDiff = distanceDiff;
        }
      }
    }

    if (!nextNodeId) {
      break;
    }

    const nextNode = graph.get(nextNodeId);
    totalDistance += calculateDistance(currentNode, nextNode);
    route.push(nextNodeId);
    currentNodeId = nextNodeId;
  }

  // Try to close the loop
  const startNode = graph.get(startNodeId);
  const endNode = graph.get(currentNodeId);
  const closingDistance = calculateDistance(startNode, endNode);
  totalDistance += closingDistance;
  route.push(startNodeId);

  if (
    Math.abs(totalDistance - desiredDistanceKm) <=
    tolerance * desiredDistanceKm
  ) {
    return { route, totalDistance };
  } else {
    throw new Error("Unable to generate a suitable circular route");
  }
}

function calculateDistance(node1, node2) {
  return turf.distance(
    turf.point([node1.lon, node1.lat]),
    turf.point([node2.lon, node2.lat]),
    { units: "kilometers" }
  );
}
