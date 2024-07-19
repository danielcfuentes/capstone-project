require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { faker } = require("@faker-js/faker");

async function generateLeaderboardData(numberOfUsers = 50) {
  console.log(`Generating leaderboard data for ${numberOfUsers} users...`);

  for (let i = 0; i < numberOfUsers; i++) {
    const username = faker.internet.userName();
    const completedChallenges = faker.number.int({ min: 0, max: 100 });

    try {
      await prisma.user.create({
        data: {
          username,
          password: faker.internet.password(), // Note: In a real app, you'd hash this password
          completedChallenges,
          isProfileComplete: true,
        },
      });

      console.log(
        `Created user: ${username} with ${completedChallenges} completed challenges`
      );
    } catch (error) {
      console.error(`Error creating user ${username}:`, error);
    }
  }

  console.log("Finished generating leaderboard data");
}

generateLeaderboardData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
