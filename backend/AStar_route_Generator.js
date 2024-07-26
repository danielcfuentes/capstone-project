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
 * Heuristic function for A*. Estimates the total distance from a node to the goal node and back to the start node.
 */
function heuristic(node, goalNode, startNode) {
  // Estimate distance to the goal node
  const distanceToGoal = calculateDistance(node, goalNode);

  // Estimate distance to return to the start node from the goal node
  const distanceFromGoalToStart = calculateDistance(goalNode, startNode);

  // Combined heuristic: distance to goal + distance from goal to start
  return distanceToGoal + distanceFromGoalToStart;
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
  fScore.set(startNodeId, heuristic(graph.get(startNodeId), graph.get(goalNodeId), graph.get(startNodeId)));

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
        fScore.set(neighborId, tentativeGScore + heuristic(neighbor, graph.get(goalNodeId), graph.get(startNodeId)));
        openSet.add(neighborId);
      }
    });
  }

  throw new Error("No path found");
}
