const assert = require("assert");
const { generateRoute } = require("../routeGenerator");

async function runTests() {
  console.log("Starting route generator tests...");

  async function testRouteGeneration(
    testName,
    lat,
    lon,
    distance,
    maxRetries = 3
  ) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `${testName}: Generating ${distance}-mile route at (${lat}, ${lon}) - Attempt ${attempt}`
        );
        const result = await generateRoute(lat, lon, distance);
        assert(result.coordinates.length > 0, "Route should have coordinates");
        assert(
          Math.abs(result.distance - distance) < 0.5,
          `Route distance should be close to ${distance} miles`
        );
        console.log(`${testName} passed:`);
        console.log(
          `  - Generated route with ${result.coordinates.length} points`
        );
        console.log(`  - Actual distance: ${result.distance.toFixed(2)} miles`);
        console.log(
          `  - Difference from requested: ${Math.abs(
            result.distance - distance
          ).toFixed(2)} miles`
        );
        return; // Test passed, exit the retry loop
      } catch (error) {
        console.error(`${testName} failed (Attempt ${attempt}):`);
        console.error(`  - Error message: ${error.message}`);
        if (attempt === maxRetries) {
          console.error(`  - Stack trace: ${error.stack}`);
        } else {
          console.log("Retrying...");
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
        }
      }
    }
  }

  // Test case 1: Generate a route in a well-mapped urban area
  await testRouteGeneration("Test 1", 40.7128, -74.006, 3); // NYC coordinates, 3-mile route

  // Test case 2: Generate a route in a less densely mapped area
  await testRouteGeneration("Test 2", 44.5588, -72.5778, 2); // Rural Vermont coordinates, 2-mile route

  // Test case 3: Attempt to generate a very short route
  await testRouteGeneration("Test 3", 51.5074, -0.1278, 0.5); // London coordinates, 0.5-mile route

  // Test case 4: Attempt to generate a route in an area with no road data
  try {
    console.log("Test 4: Generating route in an area with no road data");
    await generateRoute(0, 0, 1); // Middle of the ocean
    console.error("Test 4 failed: Expected an error but didn't get one");
  } catch (error) {
    if (
      error.message.includes("No road data found") ||
      error.message.includes("Failed to create graph from road data")
    ) {
      console.log("Test 4 passed: Correctly handled area with no road data");
    } else {
      console.error("Test 4 failed: Unexpected error");
      console.error(`  - Error message: ${error.message}`);
      console.error(`  - Stack trace: ${error.stack}`);
    }
  }

  console.log("All tests completed.");
}

runTests().catch(console.error);
