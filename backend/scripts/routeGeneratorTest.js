const assert = require("assert");
const fs = require("fs");
const { generateRoute } = require("../routeGenerator");

async function runTests() {
  const logStream = fs.createWriteStream("test_log.txt", { flags: "a" });

  function log(message) {
    logStream.write(message + "\n");
  }

  log("Starting comprehensive route generator tests...");

  const testResults = [];

  async function testRouteGeneration(
    testName,
    lat,
    lon,
    requestedDistance,
    maxRetries = 3
  ) {
    let result = {
      name: testName,
      status: "FAILED",
      attempts: maxRetries,
      requestedDistance,
      routeDistance: "N/A",
      difference: "N/A",
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        log(`\n${testName} - Attempt ${attempt}/${maxRetries}`);
        const routeResult = await generateRoute(
          lat,
          lon,
          requestedDistance,
          log
        );

        assert(
          routeResult.coordinates.length > 0,
          "Route should have coordinates"
        );
        const allowedDeviation = Math.max(0.75, requestedDistance * 0.25);
        assert(
          Math.abs(routeResult.distance - requestedDistance) < allowedDeviation,
          `Route distance (${routeResult.distance.toFixed(
            2
          )}) should be within 25% or 0.75 miles of ${requestedDistance} miles`
        );

        result.status = "PASSED";
        result.attempts = attempt;
        result.routeDistance = routeResult.distance.toFixed(2);
        result.difference = Math.abs(
          routeResult.distance - requestedDistance
        ).toFixed(2);
        log(`${testName}: PASSED`);
        break;
      } catch (error) {
        log(`${testName}: FAILED`);
        log(`  Error: ${error.message}`);
        if (attempt < maxRetries) {
          log("  Retrying...");
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          log(`  All attempts failed. Stack trace:\n${error.stack}`);
        }
      }
    }

    testResults.push(result);
  }

  // Run all tests
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
  await testRouteGeneration(
    "Test 13: Central Park NYC (0.2-mile route)",
    40.7829,
    -73.9654,
    0.2
  );
  await testRouteGeneration(
    "Test 14: Los Angeles (15-mile route)",
    34.0522,
    -118.2437,
    15
  );

  log("\nTest 15: Area with no road data");
  try {
    await generateRoute(0, 0, 1, log);
    log("Test 15: FAILED - Expected an error but didn't get one");
    testResults.push({
      name: "Test 15: Area with no road data",
      status: "FAILED",
      attempts: 1,
      requestedDistance: 1,
      routeDistance: "N/A",
      difference: "N/A",
    });
  } catch (error) {
    if (
      error.message.includes("No road data found") ||
      error.message.includes("Failed to create graph from road data")
    ) {
      log("Test 15: PASSED - Correctly handled area with no road data");
      testResults.push({
        name: "Test 15: Area with no road data",
        status: "PASSED",
        attempts: 1,
        requestedDistance: 1,
        routeDistance: "N/A",
        difference: "N/A",
      });
    } else {
      log("Test 15: FAILED - Unexpected error");
      log(`  Error: ${error.message}`);
      log(`  Stack trace:\n${error.stack}`);
      testResults.push({
        name: "Test 15: Area with no road data",
        status: "FAILED",
        attempts: 1,
        requestedDistance: 1,
        routeDistance: "N/A",
        difference: "N/A",
      });
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

  log("\nAll tests completed.");

  // Display results table
  log("\nTest Results Summary:");
  log(
    "------------------------------------------------------------------------------------------------------------------"
  );
  log(
    "| Test Name                                            | Status | Attempts | Requested Distance | Route Distance | Difference from Requested |"
  );
  log(
    "------------------------------------------------------------------------------------------------------------------"
  );
  testResults.forEach((result) => {
    log(
      `| ${result.name.padEnd(50)} | ${result.status.padEnd(
        6
      )} | ${result.attempts.toString().padEnd(8)} | ${result.requestedDistance
        .toString()
        .padEnd(17)} | ${result.routeDistance.padEnd(
        14
      )} | ${result.difference.padEnd(26)} |`
    );
  });
  log(
    "------------------------------------------------------------------------------------------------------------------"
  );

  const passedTests = testResults.filter((r) => r.status === "PASSED").length;
  const totalTests = testResults.length;
  log(
    `\nPassed ${passedTests} out of ${totalTests} tests (${(
      (passedTests / totalTests) *
      100
    ).toFixed(2)}% success rate)`
  );

  logStream.end();
}

runTests().catch(console.error);
