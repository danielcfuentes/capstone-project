const assert = require("assert");
const { generateRoute } = require("../routeGenerator");

async function runTests() {
  console.log("Starting route generator tests...");

  // Test case 1: Generate a route in a well-mapped urban area
  try {
    console.log("Test 1: Generating route in New York City");
    const result = await generateRoute(40.7128, -74.006, 3); // NYC coordinates, 3-mile route
    assert(result.coordinates.length > 0, "Route should have coordinates");
    assert(
      Math.abs(result.distance - 3) < 0.5,
      "Route distance should be close to 3 miles"
    );
    console.log("Test 1 passed");
  } catch (error) {
    console.error("Test 1 failed:", error.message);
  }

  // Test case 2: Generate a route in a less densely mapped area
  try {
    console.log("Test 2: Generating route in a rural area");
    const result = await generateRoute(44.5588, -72.5778, 2); // Rural Vermont coordinates, 2-mile route
    assert(result.coordinates.length > 0, "Route should have coordinates");
    assert(
      Math.abs(result.distance - 2) < 0.5,
      "Route distance should be close to 2 miles"
    );
    console.log("Test 2 passed");
  } catch (error) {
    console.error("Test 2 failed:", error.message);
  }

  // Test case 3: Attempt to generate a very short route
  try {
    console.log("Test 3: Generating a very short route");
    const result = await generateRoute(51.5074, -0.1278, 0.5); // London coordinates, 0.5-mile route
    assert(result.coordinates.length > 0, "Route should have coordinates");
    assert(
      Math.abs(result.distance - 0.5) < 0.2,
      "Route distance should be close to 0.5 miles"
    );
    console.log("Test 3 passed");
  } catch (error) {
    console.error("Test 3 failed:", error.message);
  }

  // Test case 4: Attempt to generate a route in an area with no road data
  try {
    console.log("Test 4: Generating route in an area with no road data");
    await generateRoute(0, 0, 1); // Middle of the ocean
    console.error("Test 4 failed: Expected an error but didn't get one");
  } catch (error) {
    assert(
      error.message.includes("No road data found"),
      "Error message should indicate no road data"
    );
    console.log("Test 4 passed");
  }

  console.log("All tests completed.");
}

runTests().catch(console.error);
