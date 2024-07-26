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

  try {
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        timeout: 10000, // 10 seconds timeout
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching road network:", error.message);
    throw new Error("Failed to fetch road network data");
  }
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
  tolerance = 0.2
) {
  const visited = new Set();
  const route = [startNodeId];
  let currentNodeId = startNodeId;
  let totalDistance = 0;
  const maxAttempts = 1000;
  let attempts = 0;

  while (totalDistance < desiredDistanceKm && attempts < maxAttempts) {
    attempts++;
    visited.add(currentNodeId);
    const currentNode = graph.get(currentNodeId);

    if (!currentNode || currentNode.connections.size === 0) {
      break;
    }

    let candidates = Array.from(currentNode.connections)
      .filter((neighborId) => !visited.has(neighborId))
      .map((neighborId) => ({
        id: neighborId,
        distance: calculateDistance(currentNode, graph.get(neighborId)),
      }));

    if (candidates.length === 0) {
      // If no unvisited neighbors, try to close the loop
      candidates = Array.from(currentNode.connections).map((neighborId) => ({
        id: neighborId,
        distance: calculateDistance(currentNode, graph.get(neighborId)),
      }));
    }

    if (candidates.length === 0) {
      break;
    }

    // Sort candidates by how close they get us to the desired distance
    candidates.sort(
      (a, b) =>
        Math.abs(totalDistance + a.distance - desiredDistanceKm) -
        Math.abs(totalDistance + b.distance - desiredDistanceKm)
    );

    const chosen = candidates[0];
    totalDistance += chosen.distance;
    route.push(chosen.id);
    currentNodeId = chosen.id;

    // If we're close enough to the desired distance, try to close the loop
    if (
      Math.abs(totalDistance - desiredDistanceKm) <=
      tolerance * desiredDistanceKm
    ) {
      const startNode = graph.get(startNodeId);
      const endNode = graph.get(currentNodeId);
      const closingDistance = calculateDistance(startNode, endNode);
      if (closingDistance <= 0.1 * desiredDistanceKm) {
        totalDistance += closingDistance;
        route.push(startNodeId);
        break;
      }
    }
  }

  if (
    Math.abs(totalDistance - desiredDistanceKm) <=
    tolerance * desiredDistanceKm
  ) {
    return { route, totalDistance };
  } else {
    throw new Error(
      `Unable to generate a suitable route. Got ${totalDistance.toFixed(
        2
      )}km, wanted ${desiredDistanceKm.toFixed(2)}km`
    );
  }
}

function calculateDistance(node1, node2) {
  return turf.distance(
    turf.point([node1.lon, node1.lat]),
    turf.point([node2.lon, node2.lat]),
    { units: "kilometers" }
  );
}

async function generateRoute(startLat, startLng, desiredDistanceMiles) {
  const desiredDistanceKm = desiredDistanceMiles * 1.60934;
  const radiusKm = Math.max(desiredDistanceKm * 0.7, 3);

  try {
    const osmData = await fetchRoadNetwork(startLat, startLng, radiusKm);

    if (!osmData.elements || osmData.elements.length === 0) {
      throw new Error("No road data found in the specified area.");
    }

    const graph = createGraph(osmData);

    if (graph.size === 0) {
      throw new Error("Failed to create graph from road data.");
    }

    const startNode = findClosestNode(graph, startLat, startLng);
    if (!startNode) {
      throw new Error("Unable to find a suitable starting point.");
    }

    const { route, totalDistance } = generateCircularRoute(
      graph,
      startNode.id,
      desiredDistanceKm
    );

    const coordinates = route
      .map((nodeId) => {
        const node = graph.get(nodeId);
        return node ? [node.lon, node.lat] : null;
      })
      .filter((coord) => coord !== null);

    return {
      coordinates,
      distance: totalDistance / 1.60934, // Convert back to miles
    };
  } catch (error) {
    console.error("Error in generateRoute:", error);
    throw error;
  }
}

module.exports = { generateRoute };
