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
  tolerance = 0.1
) {
  const visited = new Set();
  let bestRoute = null;
  let bestTotalDistance = 0;
  const route = [startNodeId];
  let currentNodeId = startNodeId;
  let totalDistance = 0;
  const maxAttempts = 5000; // Increased max attempts
  let attempts = 0;

  console.log(
    `Generating circular route: desired distance = ${desiredDistanceKm.toFixed(
      2
    )} km`
  );

  while (attempts < maxAttempts) {
    attempts++;
    visited.add(currentNodeId);
    const currentNode = graph.get(currentNodeId);

    if (!currentNode || currentNode.connections.size === 0) {
      console.log(`Dead end reached at node ${currentNodeId}`);
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
      console.log(`No valid candidates found for node ${currentNodeId}`);
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

    // Check if we can close the loop
    const startNode = graph.get(startNodeId);
    const endNode = graph.get(currentNodeId);
    const closingDistance = calculateDistance(startNode, endNode);
    const potentialTotalDistance = totalDistance + closingDistance;

    if (
      Math.abs(potentialTotalDistance - desiredDistanceKm) <=
      tolerance * desiredDistanceKm
    ) {
      totalDistance = potentialTotalDistance;
      route.push(startNodeId);
      if (
        !bestRoute ||
        Math.abs(totalDistance - desiredDistanceKm) <
          Math.abs(bestTotalDistance - desiredDistanceKm)
      ) {
        bestRoute = [...route];
        bestTotalDistance = totalDistance;
      }
      break;
    }

    // Update best route if this one is closer to the desired distance
    if (
      !bestRoute ||
      Math.abs(totalDistance - desiredDistanceKm) <
        Math.abs(bestTotalDistance - desiredDistanceKm)
    ) {
      bestRoute = [...route];
      bestTotalDistance = totalDistance;
    }

    if (attempts % 100 === 0) {
      console.log(
        `Attempt ${attempts}: Current distance = ${totalDistance.toFixed(2)} km`
      );
    }
  }

  console.log(
    `Route generation completed: best distance = ${bestTotalDistance.toFixed(
      2
    )} km, attempts = ${attempts}`
  );

  if (bestRoute) {
    return { route: bestRoute, totalDistance: bestTotalDistance };
  } else {
    throw new Error(
      `Unable to generate a suitable route. Best distance: ${bestTotalDistance.toFixed(
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
    console.log(
      `Fetching road network for (${startLat}, ${startLng}) with radius ${radiusKm.toFixed(
        2
      )} km`
    );
    const osmData = await fetchRoadNetwork(startLat, startLng, radiusKm);

    if (!osmData.elements || osmData.elements.length === 0) {
      throw new Error("No road data found in the specified area.");
    }

    console.log(`Creating graph from ${osmData.elements.length} elements`);
    const graph = createGraph(osmData);

    if (graph.size === 0) {
      throw new Error("Failed to create graph from road data.");
    }

    console.log(`Graph created with ${graph.size} nodes`);
    const startNode = findClosestNode(graph, startLat, startLng);
    if (!startNode) {
      throw new Error("Unable to find a suitable starting point.");
    }

    console.log(
      `Starting node found: id=${startNode.id}, lat=${startNode.lat}, lon=${startNode.lon}`
    );
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
