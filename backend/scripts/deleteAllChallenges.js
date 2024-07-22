const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function deleteAllChallenges() {
  try {
    const deletedChallenges = await prisma.challenge.deleteMany({});
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllChallenges()
  .then(() => "Challenge deletion process completed.")
  .catch((e) => {
    process.exit(1);
  });
