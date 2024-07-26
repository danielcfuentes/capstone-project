const turf = require("@turf/turf"); // Importing the turf library for geospatial calculations
const axios = require("axios"); // Importing axios for making HTTP requests

/**
 * Fetches the road network data from the Overpass API within a specified radius around a starting point.
 */
async function fetchRoadNetwork(startLat, startLng, radiusKm, log) {
  // Constructing the Overpass API query to fetch road data within the radius
  const query = `
    [out:json];
    (
      way["highway"](around:${radiusKm * 1000},${startLat},${startLng});
      >;
    );
    out body;
  `;

  try {
    // Sending a POST request to the Overpass API with the constructed query
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      {
        timeout: 10000, // Setting a timeout of 10 seconds for the request
      }
    );
    // Returning the response data which contains the road network
    return response.data;
  } catch (error) {
    // Logging any errors that occur during the request
    log("Error fetching road network:", error.message);
    throw new Error("Failed to fetch road network data");
  }
}

/**
 * Creates a graph representation of the road network from the OSM data.
 */
function createGraph(osmData) {
  const graph = new Map(); // Initialize an empty graph

  // Adding nodes to the graph
  osmData.elements.forEach((element) => {
    if (element.type === "node") {
      // Each node is represented with its ID, latitude, longitude, and an empty set of connections
      graph.set(element.id, {
        id: element.id,
        lat: element.lat,
        lon: element.lon,
        connections: new Set(),
      });
    }
  });

  // Adding edges to the graph based on the ways (roads)
  osmData.elements.forEach((element) => {
    if (
      element.type === "way" &&
      element.tags &&
      (element.tags.highway || element.tags.footway) // Consider only relevant types of roads
    ) {
      // Loop through nodes in the way to create connections
      for (let i = 0; i < element.nodes.length - 1; i++) {
        const node1 = graph.get(element.nodes[i]);
        const node2 = graph.get(element.nodes[i + 1]);

        if (node1 && node2) {
          // Add bi-directional connections between nodes
          node1.connections.add(node2.id);
          node2.connections.add(node1.id);
        }
      }
    }
  });

  return graph; // Return the constructed graph
}

/**
 * Finds the closest node in the graph to a given latitude and longitude.
 */
function findClosestNode(graph, lat, lng) {
  let closestNode = null;
  let minDistance = Infinity;

  // Iterate through all nodes in the graph to find the closest one
  for (const node of graph.values()) {
    // Calculate distance between the reference point and the node
    const distance = turf.distance(
      turf.point([lng, lat]),
      turf.point([node.lon, node.lat]),
      { units: "kilometers" }
    );
    // Update the closest node if the current node is closer
    if (distance < minDistance) {
      minDistance = distance;
      closestNode = node;
    }
  }

  return closestNode; // Return the closest node found
}

/**
 * Generates a circular route from a given starting node to approach the desired distance.
 */
function generateCircularRoute(
  graph,
  startNodeId,
  desiredDistanceKm,
  log,
  tolerance = 0.1
) {
  const visited = new Set(); // Set to keep track of visited nodes
  let bestRoute = null; // Variable to store the best route found
  let bestTotalDistance = 0; // Variable to store the best total distance found
  const route = [startNodeId]; // Initialize the route with the starting node
  let currentNodeId = startNodeId; // Current node ID in the route generation process
  let totalDistance = 0; // Total distance of the current route
  const maxAttempts = 5000; // Maximum number of attempts to generate the route
  let attempts = 0; // Counter for the number of attempts made

  log(
    `Generating circular route: desired distance = ${desiredDistanceKm.toFixed(
      2
    )} km`
  );

  // Main loop to generate the route
  while (attempts < maxAttempts) {
    attempts++;
    visited.add(currentNodeId); // Mark the current node as visited
    const currentNode = graph.get(currentNodeId);

    if (!currentNode || currentNode.connections.size === 0) {
      log(`Dead end reached at node ${currentNodeId}`);
      break; // Exit if no further connections are available
    }

    // Get unvisited neighbors of the current node
    let candidates = Array.from(currentNode.connections)
      .filter((neighborId) => !visited.has(neighborId))
      .map((neighborId) => ({
        id: neighborId,
        distance: calculateDistance(currentNode, graph.get(neighborId)),
      }));

    // If no unvisited neighbors are available, try to use all neighbors
    if (candidates.length === 0) {
      candidates = Array.from(currentNode.connections).map((neighborId) => ({
        id: neighborId,
        distance: calculateDistance(currentNode, graph.get(neighborId)),
      }));
    }

    if (candidates.length === 0) {
      log(`No valid candidates found for node ${currentNodeId}`);
      break; // Exit if no candidates are found
    }

    // Sort candidates based on how close they get us to the desired distance
    candidates.sort(
      (a, b) =>
        Math.abs(totalDistance + a.distance - desiredDistanceKm) -
        Math.abs(totalDistance + b.distance - desiredDistanceKm)
    );

    const chosen = candidates[0]; // Select the candidate with the best distance approximation
    totalDistance += chosen.distance; // Update the total distance
    route.push(chosen.id); // Add the chosen node to the route
    currentNodeId = chosen.id; // Update the current node ID

    // Check if we can close the loop by connecting back to the start node
    const startNode = graph.get(startNodeId);
    const endNode = graph.get(currentNodeId);
    const closingDistance = calculateDistance(startNode, endNode);
    const potentialTotalDistance = totalDistance + closingDistance;

    if (
      Math.abs(potentialTotalDistance - desiredDistanceKm) <=
      tolerance * desiredDistanceKm
    ) {
      totalDistance = potentialTotalDistance; // Update the total distance
      route.push(startNodeId); // Add the start node to close the loop
      if (
        !bestRoute ||
        Math.abs(totalDistance - desiredDistanceKm) <
          Math.abs(bestTotalDistance - desiredDistanceKm)
      ) {
        bestRoute = [...route]; // Update the best route if this one is better
        bestTotalDistance = totalDistance; // Update the best total distance
      }
      break; // Exit the loop as a suitable route has been found
    }

    // Update best route if this route is closer to the desired distance
    if (
      !bestRoute ||
      Math.abs(totalDistance - desiredDistanceKm) <
        Math.abs(bestTotalDistance - desiredDistanceKm)
    ) {
      bestRoute = [...route];
      bestTotalDistance = totalDistance;
    }

    // Log progress every 100 attempts
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
    return { route: bestRoute, totalDistance: bestTotalDistance }; // Return the best route and its distance
  } else {
    throw new Error(
      `Unable to generate a suitable route. Best distance: ${bestTotalDistance.toFixed(
        2
      )}km, wanted ${desiredDistanceKm.toFixed(2)}km`
    );
  }
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
 * Generates a circular route starting from a given location with a desired distance.
 */
async function generateRoute(startLat, startLng, desiredDistanceMiles, log) {
  // Convert desired distance from miles to kilometers
  const desiredDistanceKm = desiredDistanceMiles * 1.60934;
  // Calculate search radius, ensuring it is at least 3 km
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

    // Fetch the road network data within the specified radius
    const osmData = await fetchRoadNetwork(startLat, startLng, radiusKm, log);

    // Check if data was successfully fetched
    if (!osmData.elements || osmData.elements.length === 0) {
      throw new Error("No road data found in the specified area.");
    }

    log(`  Road network: ${osmData.elements.length} elements`);
    // Create a graph from the fetched road network data
    const graph = createGraph(osmData);

    // Check if the graph was successfully created
    if (graph.size === 0) {
      throw new Error("Failed to create graph from road data.");
    }

    log(`  Graph: ${graph.size} nodes`);
    // Find the closest node to the starting point
    const startNode = findClosestNode(graph, startLat, startLng);
    if (!startNode) {
      throw new Error("Unable to find a suitable starting point.");
    }

    log(
      `  Start node: id=${startNode.id}, (${startNode.lat.toFixed(
        4
      )}, ${startNode.lon.toFixed(4)})`
    );
    // Generate the circular route starting from the closest node
    const { route, totalDistance } = generateCircularRoute(
      graph,
      startNode.id,
      desiredDistanceKm,
      log
    );

    // Convert route nodes to coordinates
    const coordinates = route
      .map((nodeId) => {
        const node = graph.get(nodeId);
        return node ? [node.lon, node.lat] : null;
      })
      .filter((coord) => coord !== null);

    // Convert total distance back to miles
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
    // Log any errors that occur during the route generation process
    log("\nError in generateRoute:", error.message);
    throw error;
  }
}

module.exports = { generateRoute }; // Exporting the generateRoute function for use in other modules
