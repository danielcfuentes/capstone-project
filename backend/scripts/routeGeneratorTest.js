const assert = require("assert");
const { generateRoute } = require("../routeGenerator");

async function runTests() {
  console.log("Starting comprehensive route generator tests...");

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
          Math.abs(result.distance - distance) <
            Math.max(0.75, distance * 0.25),
          `Route distance (${result.distance.toFixed(
            2
          )}) should be within 25% or 0.75 miles of ${distance} miles`
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

  // Original tests
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

  // Additional urban area tests
  await testRouteGeneration(
    "Test 4: San Francisco (5-mile route)",
    37.7749,
    -122.4194,
    5
  );
  await testRouteGeneration(
    "Test 5: Tokyo (10-mile route)",
    35.6762,
    139.6503,
    10
  );
  await testRouteGeneration("Test 6: Paris (1-mile route)", 48.8566, 2.3522, 1);

  // Suburban and rural area tests
  await testRouteGeneration(
    "Test 7: Suburban Chicago (4-mile route)",
    42.0654,
    -87.9368,
    4
  );
  await testRouteGeneration(
    "Test 8: Rural Australia (6-mile route)",
    -33.8688,
    151.2093,
    6
  );

  // Mountain/hill area tests
  await testRouteGeneration(
    "Test 9: Rocky Mountains (3-mile route)",
    40.3772,
    -105.5217,
    3
  );
  await testRouteGeneration(
    "Test 10: Swiss Alps (2-mile route)",
    46.5197,
    7.9597,
    2
  );

  // Coastal area tests
  await testRouteGeneration(
    "Test 11: Miami Beach (1.5-mile route)",
    25.7907,
    -80.13,
    1.5
  );
  await testRouteGeneration(
    "Test 12: Greek Islands (2.5-mile route)",
    37.4467,
    25.3289,
    2.5
  );

  // Very short route test
  await testRouteGeneration(
    "Test 13: Central Park NYC (0.2-mile route)",
    40.7829,
    -73.9654,
    0.2
  );

  // Long route test
  await testRouteGeneration(
    "Test 14: Los Angeles (15-mile route)",
    34.0522,
    -118.2437,
    15
  );

  // Edge case tests
  console.log("\nTest 15: Area with no road data");
  try {
    await generateRoute(0, 0, 1);
    console.error("Test 15: FAILED - Expected an error but didn't get one");
  } catch (error) {
    if (
      error.message.includes("No road data found") ||
      error.message.includes("Failed to create graph from road data")
    ) {
      console.log("Test 15: PASSED - Correctly handled area with no road data");
    } else {
      console.error("Test 15: FAILED - Unexpected error");
      console.error(`  Error: ${error.message}`);
      console.error(`  Stack trace:\n${error.stack}`);
    }
  }

  await testRouteGeneration(
    "Test 16: Very dense urban area (Beijing 1-mile route)",
    39.9042,
    116.4074,
    1
  );
  await testRouteGeneration(
    "Test 17: Island (Honolulu 3-mile route)",
    21.3069,
    -157.8583,
    3
  );

  console.log("\nAll tests completed.");
}

runTests().catch(console.error);
