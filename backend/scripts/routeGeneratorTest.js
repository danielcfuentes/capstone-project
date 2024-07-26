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
        console.log(`\n${testName} - Attempt ${attempt}/${maxRetries}`);
        const result = await generateRoute(lat, lon, distance);

        assert(result.coordinates.length > 0, "Route should have coordinates");
        assert(
          Math.abs(result.distance - distance) < 0.75,
          `Route distance (${result.distance.toFixed(
            2
          )}) should be close to ${distance} miles`
        );

        console.log(`${testName}: PASSED`);
        return;
      } catch (error) {
        console.error(`${testName}: FAILED`);
        console.error(`  Error: ${error.message}`);
        if (attempt < maxRetries) {
          console.log("  Retrying...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.error(`  All attempts failed. Stack trace:\n${error.stack}`);
        }
      }
    }
  }

  await testRouteGeneration("Test 1: NYC (3-mile route)", 40.7128, -74.006, 3);
  await testRouteGeneration(
    "Test 2: Rural Vermont (2-mile route)",
    44.5588,
    -72.5778,
    2
  );
  await testRouteGeneration(
    "Test 3: London (0.5-mile route)",
    51.5074,
    -0.1278,
    0.5
  );

  console.log("\nTest 4: Area with no road data");
  try {
    await generateRoute(0, 0, 1);
    console.error("Test 4: FAILED - Expected an error but didn't get one");
  } catch (error) {
    if (
      error.message.includes("No road data found") ||
      error.message.includes("Failed to create graph from road data")
    ) {
      console.log("Test 4: PASSED - Correctly handled area with no road data");
    } else {
      console.error("Test 4: FAILED - Unexpected error");
      console.error(`  Error: ${error.message}`);
      console.error(`  Stack trace:\n${error.stack}`);
    }
  }

  console.log("\nAll tests completed.");
}

runTests().catch(console.error);
