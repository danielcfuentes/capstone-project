const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

async function generateMockActivities(userId, count) {
  const activities = [];

  for (let i = 0; i < count; i++) {
    const startDateTime = new Date(
      Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000
    );
    const duration = randomInt(900, 5400); // 15 to 90 minutes
    const distance = randomFloat(2000, 15000); // 2 to 15 km
    const averagePace = duration / 60 / (distance / 1000);

    const activity = {
      userId,
      activityType: "Run",
      startDateTime,
      duration,
      distance,
      averagePace,
      averageHeartRate: randomInt(120, 180),
      maxHeartRate: randomInt(150, 200),
      caloriesBurned: randomInt(200, 1000),
      elevationGain: randomFloat(0, 500),
      elevationLoss: randomFloat(0, 500),
      startLatitude: randomFloat(-90, 90),
      startLongitude: randomFloat(-180, 180),
      endLatitude: randomFloat(-90, 90),
      endLongitude: randomFloat(-180, 180),
    };

    activities.push(activity);
  }

  return activities;
}

async function main() {
  try {
    const user = await prisma.user.findFirst(); // Get the first user
    if (!user) {
      console.log("No user found. Please create a user first.");
      return;
    }

    const mockActivities = await generateMockActivities(user.id, 20);

    await prisma.userActivity.createMany({
      data: mockActivities,
    });

    console.log("Mock activities created successfully.");
  } catch (error) {
    console.error("Error creating mock activities:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
