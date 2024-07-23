require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function meterToMile(meters) {
  return meters / 1609.34;
}

function meterToFeet(meters) {
  return meters * 3.28084;
}

function generateRouteCoordinates(startLat, startLon, numPoints) {
  const coordinates = [[startLon, startLat]];
  let currentLat = startLat;
  let currentLon = startLon;

  for (let i = 1; i < numPoints; i++) {
    // Generate small random changes in latitude and longitude
    const latChange = randomFloat(-0.001, 0.001);
    const lonChange = randomFloat(-0.001, 0.001);

    currentLat += latChange;
    currentLon += lonChange;

    coordinates.push([currentLon, currentLat]);
  }

  // Ensure the route ends close to where it started
  coordinates.push([startLon, startLat]);

  return coordinates;
}

async function generateMockActivities(userId, count) {
  const activities = [];

  for (let i = 0; i < count; i++) {
    const startDateTime = new Date(
      Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000
    );
    const durationSeconds = randomInt(900, 5400); // 15 to 90 minutes
    const distanceMeters = randomFloat(2000, 15000); // 2 to 15 km
    const distanceMiles = meterToMile(distanceMeters);
    const averagePaceMinPerMile = durationSeconds / 60 / distanceMiles;

    const startLatitude = randomFloat(25, 48); // Approximate latitude range for continental US
    const startLongitude = randomFloat(-125, -66); // Approximate longitude range for continental US

    const routeCoordinates = generateRouteCoordinates(
      startLatitude,
      startLongitude,
      20
    );
    const endLatitude = routeCoordinates[routeCoordinates.length - 1][1];
    const endLongitude = routeCoordinates[routeCoordinates.length - 1][0];

    const activity = {
      userId,
      activityType: "Run",
      startDateTime,
      duration: durationSeconds,
      distance: distanceMiles,
      averagePace: averagePaceMinPerMile,
      averageHeartRate: randomInt(120, 180),
      maxHeartRate: randomInt(150, 200),
      caloriesBurned: randomInt(200, 1000),
      elevationGain: meterToFeet(randomFloat(0, 150)),
      elevationLoss: meterToFeet(randomFloat(0, 150)),
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
      routeCoordinates: JSON.stringify(routeCoordinates),
    };

    activities.push(activity);
  }

  return activities;
}

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return;
    }

    const mockActivities = await generateMockActivities(user.id, 20);

    await prisma.userActivity.createMany({
      data: mockActivities,
    });
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

main();
