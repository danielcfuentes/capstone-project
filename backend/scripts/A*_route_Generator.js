const fs = require("fs");
const { generateRouteWithAStar } = require("../AStar_route_Generator");

// Configuration
const startLat = 40.73061; // Example latitude
const startLng = -73.935242; // Example longitude
const desiredDistanceMiles = 5; // Desired route distance in miles

// Logging function that writes to a file
const logToFile = (message) => {
  fs.appendFileSync("route_generation_output.txt", message + "\n");
};

async function testGenerateRoute() {
  try {
    logToFile("Starting route generation...\n");

    const result = await generateRouteWithAStar(
      startLat,
      startLng,
      desiredDistanceMiles,
      logToFile
    );

    logToFile("\nRoute generation completed:\n");
    logToFile(`Distance: ${result.distance.toFixed(2)} miles\n`);
    logToFile("Coordinates:\n");
    result.coordinates.forEach((coord, index) => {
      logToFile(
        `Point ${index + 1}: Latitude: ${coord[1].toFixed(
          6
        )}, Longitude: ${coord[0].toFixed(6)}`
      );
    });

    logToFile("\nTest completed successfully.");
  } catch (error) {
    logToFile(`Error: ${error.message}`);
  }
}

testGenerateRoute();
