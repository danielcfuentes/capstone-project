const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function deleteAllChallenges() {
  try {
    const deletedChallenges = await prisma.challenge.deleteMany({});
    console.log(`Successfully deleted ${deletedChallenges.count} challenges.`);
  } catch (error) {
    console.error("Error deleting challenges:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllChallenges()
  .then(() => console.log("Challenge deletion process completed."))
  .catch((e) => {
    console.error("Unhandled error in challenge deletion process:", e);
    process.exit(1);
  });
