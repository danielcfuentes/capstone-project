require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { faker } = require("@faker-js/faker");

async function generateLeaderboardData(numberOfUsers = 50) {

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

    } catch (error) {
      (`Error creating user ${username}:`, error);
    }
  }
}

generateLeaderboardData()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
