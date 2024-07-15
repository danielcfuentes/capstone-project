require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function deleteMockActivities() {
  try {
    const deletedActivities = await prisma.userActivity.deleteMany({});
    console.log(`Deleted ${deletedActivities.count} mock activities.`);
  } catch (error) {
    console.error("Error deleting mock activities:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteMockActivities();
