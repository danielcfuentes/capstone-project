const turf = require("@turf/turf"); // Importing the turf library for geospatial calculations
const axios = require("axios"); // Importing axios for making HTTP requests

/**
 * Fetches the road network data from the Overpass API within a specified radius around a starting point.
 */
async function fetchRoadNetwork(startLat, startLng, radiusKm, log) {
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
    log("Error fetching road network:", error.message);
    throw new Error("Failed to fetch road network data");
  }
}

/**
 * Creates a graph representation of the road network from the OSM data.
 */
function createGraph(osmData) {
  const graph = new Map();

  // Add nodes to the graph
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

  // Add edges to the graph based on ways
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

/**
 * Finds the closest node in the graph to a given latitude and longitude.
 */
function findClosestNode(graph, lat, lng) {
  let closestNode = null;
  let minDistance = Infinity;

  for (const node of graph.values()) {
    const distance = calculateDistance({ lat: lat, lon: lng }, node);
    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node;
    }
  }

  return closestNode;
}

/**
 * Calculates the distance between two nodes using their coordinates.
 */
function calculateDistance(node1, node2) {
  return turf.distance(
    turf.point([node1.lon, node1.lat]),
    turf.point([node2.lon, node2.lat]),
    { units: "kilometers" }
  );
}

/**
 * Refined heuristic function for A*. Estimates the total distance from a node to the goal node and back to the start node.
 */
function refinedHeuristic(node, goalNode, startNode) {
  const distanceToGoal = calculateDistance(node, goalNode);
  const distanceFromGoalToStart = calculateDistance(goalNode, startNode);

  // Heuristic considers the straight-line distance to the goal and back to start
  // Additionally, include a penalty to discourage unnecessary loops
  const penaltyFactor = 0.1; // Adjust as needed
  return distanceToGoal + distanceFromGoalToStart + penaltyFactor * distanceToGoal;
}


/**
 * A* algorithm for finding a path with a circular route.
 */
function aStarAlgorithm(graph, startNodeId, goalNodeId, log) {
  const openSet = new Set([startNodeId]);
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  // Initialize scores
  graph.forEach((node) => {
    gScore.set(node.id, Infinity);
    fScore.set(node.id, Infinity);
  });
  gScore.set(startNodeId, 0);
  fScore.set(startNodeId, refinedHeuristic(graph.get(startNodeId), graph.get(goalNodeId), graph.get(startNodeId)));

  while (openSet.size > 0) {
    // Get the node in the open set with the lowest fScore
    let current = [...openSet].reduce((a, b) => (fScore.get(a) < fScore.get(b) ? a : b));

    // Check if we reached the goal
    if (current === goalNodeId) {
      const path = [];
      let temp = current;
      while (cameFrom.has(temp)) {
        path.push(temp);
        temp = cameFrom.get(temp);
      }
      path.push(startNodeId);
      path.reverse();
      return { path, distance: gScore.get(goalNodeId) };
    }

    openSet.delete(current);
    const currentNode = graph.get(current);

    currentNode.connections.forEach((neighborId) => {
      const neighbor = graph.get(neighborId);
      const tentativeGScore = gScore.get(current) + calculateDistance(currentNode, neighbor);

      if (tentativeGScore < gScore.get(neighborId)) {
        cameFrom.set(neighborId, current);
        gScore.set(neighborId, tentativeGScore);
        fScore.set(neighborId, tentativeGScore + refinedHeuristic(neighbor, graph.get(goalNodeId), graph.get(startNodeId)));
        openSet.add(neighborId);
      }
    });
  }

  throw new Error("No path found");
}

/**
 * Generates a circular route based on the A* algorithm.
 */
function generateCircularRoute(
  graph,
  startNodeId,
  desiredDistanceKm,
  log,
  tolerance = 0.1
) {
  const visited = new Set();
  let bestRoute = null;
  let bestTotalDistance = Infinity;
  const route = [startNodeId];
  let currentNodeId = startNodeId;
  let totalDistance = 0;
  const maxAttempts = 5000;
  let attempts = 0;

  log(
    `Generating circular route: desired distance = ${desiredDistanceKm.toFixed(
      2
    )} km`
  );

  while (attempts < maxAttempts) {
    attempts++;
    visited.add(currentNodeId);
    const currentNode = graph.get(currentNodeId);

    if (!currentNode || currentNode.connections.size === 0) {
      log(`Dead end reached at node ${currentNodeId}`);
      break;
    }

    let candidates = Array.from(currentNode.connections)
      .filter((neighborId) => !visited.has(neighborId))
      .map((neighborId) => ({
        id: neighborId,
        distance: calculateDistance(currentNode, graph.get(neighborId)),
      }));

    if (candidates.length === 0) {
      candidates = Array.from(currentNode.connections).map((neighborId) => ({
        id: neighborId,
        distance: calculateDistance(currentNode, graph.get(neighborId)),
      }));
    }

    if (candidates.length === 0) {
      log(`No valid candidates found for node ${currentNodeId}`);
      break;
    }

    // Sort candidates to get closest distance to desired distance
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

    // Remove redundant points by checking distances between consecutive points
    if (route.length > 2) {
      const lastPoint = graph.get(route[route.length - 1]);
      const secondLastPoint = graph.get(route[route.length - 2]);
      if (calculateDistance(lastPoint, secondLastPoint) < 0.01) {
        // Threshold for redundancy
        route.pop();
        totalDistance -= calculateDistance(secondLastPoint, lastPoint);
      }
    }

    if (attempts % 100 === 0) {
      log(
        `Attempt ${attempts}: Current distance = ${totalDistance.toFixed(2)} km`
      );
    }
  }

  log(
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
      )} km, wanted ${desiredDistanceKm.toFixed(2)} km`
    );
  }
}

/**
 * Generates a route based on the starting location and desired distance.
 */
async function generateRouteWithAStar(startLat, startLng, desiredDistanceMiles, log) {
  const desiredDistanceKm = desiredDistanceMiles * 1.60934;
  const radiusKm = Math.max(desiredDistanceKm * 0.7, 3);

  try {
    log(`\nGenerating route:`);
    log(`  Start: (${startLat.toFixed(4)}, ${startLng.toFixed(4)})`);
    log(
      `  Desired distance: ${desiredDistanceMiles.toFixed(
        2
      )} miles (${desiredDistanceKm.toFixed(2)} km)`
    );
    log(`  Search radius: ${radiusKm.toFixed(2)} km`);

    const osmData = await fetchRoadNetwork(startLat, startLng, radiusKm, log);

    if (!osmData.elements || osmData.elements.length === 0) {
      throw new Error("No road data found in the specified area.");
    }

    log(`  Road network: ${osmData.elements.length} elements`);
    const graph = createGraph(osmData);

    if (graph.size === 0) {
      throw new Error("Failed to create graph from road data.");
    }

    log(`  Graph: ${graph.size} nodes`);
    const startNode = findClosestNode(graph, startLat, startLng);
    if (!startNode) {
      throw new Error("Unable to find a suitable starting point.");
    }

    log(
      `  Start node: id=${startNode.id}, (${startNode.lat.toFixed(
        4
      )}, ${startNode.lon.toFixed(4)})`
    );
    const { route, totalDistance } = generateCircularRoute(
      graph,
      startNode.id,
      desiredDistanceKm,
      log
    );

    const coordinates = route
      .map((nodeId) => {
        const node = graph.get(nodeId);
        return node ? [node.lon, node.lat] : null;
      })
      .filter((coord) => coord !== null);

    const resultDistanceMiles = totalDistance / 1.60934;
    log(`\nRoute generated:`);
    log(`  Points: ${coordinates.length}`);
    log(
      `  Distance: ${resultDistanceMiles.toFixed(
        2
      )} miles (${totalDistance.toFixed(2)} km)`
    );
    log(
      `  Difference: ${Math.abs(
        resultDistanceMiles - desiredDistanceMiles
      ).toFixed(2)} miles`
    );

    return {
      coordinates,
      distance: resultDistanceMiles,
    };
  } catch (error) {
    log("\nError in generateRoute:", error.message);
    throw error;
  }
}

module.exports = { generateRouteWithAStar };
