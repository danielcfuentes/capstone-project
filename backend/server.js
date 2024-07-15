require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const PORT = process.env.SERVER_PORT;
const multer = require("multer");

app.use(express.json());
app.use(cors());
// 4. Add a cron job to generate challenges weekly (you'll need to install a cron library)
const cron = require('node-cron');

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return res.sendStatus(403);

    // Fetch the user from the database to get the ID
    const dbUser = await prisma.user.findUnique({
      where: { username: user.name },
    });
    if (!dbUser) return res.sendStatus(403);

    req.user = { id: dbUser.id, name: user.name };
    next();
  });
}

// Create a new post
const upload = multer({ storage: multer.memoryStorage() });

app.post(
  "/posts",
  authenticateToken,
  upload.array("images"),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const images = req.files || []; // Provide a default empty array if req.files is undefined

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      const newPost = await prisma.post.create({
        data: {
          title,
          content: content || "",
          userId: req.user.name,
          images: {
            create: images.map((image) => ({
              data: image.buffer,
              mimeType: image.mimetype,
            })),
          },
        },
        include: { images: true },
      });

      res.json(newPost);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to create post", details: error.message });
    }
  }
);

app.get("/allposts", authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        images: {
          select: {
            id: true,
            mimeType: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedPosts = posts.map((post) => ({
      ...post,
      images: post.images.map((image) => ({
        id: image.id,
        url: `/images/${image.id}`,
        mimeType: image.mimeType,
      })),
    }));

    res.json(transformedPosts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching all posts", error: error.message });
  }
});

app.get("/images/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
    });
    if (!image) {
      return res.status(404).send("Image not found");
    }

    res.set("Content-Type", image.mimeType);
    res.send(image.data);
  } catch (error) {
    res.status(500).send("Error retrieving image");
  }
});

app.put("/profile", authenticateToken, async (req, res) => {
  const {
    age,
    gender,
    weight,
    height,
    fitnessLevel,
    runningExperience,
    preferredTerrains,
    healthConditions,
    isProfileComplete,
  } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { username: req.user.name },
      data: {
        age,
        gender,
        weight,
        height,
        fitnessLevel,
        runningExperience,
        preferredTerrains,
        healthConditions,
        isProfileComplete,
      },
    });
    res.json({
      message: "Profile updated successfully",
      isProfileComplete: updatedUser.isProfileComplete,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.user.name },
      select: {
        age: true,
        gender: true,
        weight: true,
        height: true,
        fitnessLevel: true,
        runningExperience: true,
        preferredTerrains: true,
        healthConditions: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// New endpoint to fetch user activities
app.get("/user-activities", authenticateToken, async (req, res) => {
  try {
    const activities = await prisma.userActivity.findMany({
      where: { userId: req.user.id },
      orderBy: { startDateTime: "desc" },
      take: 10, // Limit to 10 most recent activities
    });
    res.json(activities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching activities", error: error.message });
  }
});

// Function to calculate calories burned based on user profile and route

const calculateCaloriesBurned = (user, distance, elevationGain) => {
  // This is a simplified calculation and should be refined for more accuracy
  const weight = user.weight * 0.453592; // Convert lbs to kg
  const duration = parseFloat(distance) * 10; // Assume 10 minutes per mile
  const caloriesPerMinute = 0.0175 * 8 * weight; // MET value of 8 for running
  return Math.round(caloriesPerMinute * duration);
};

app.post("/save-route-activity", authenticateToken, async (req, res) => {
  try {
    const {
      distance,
      duration,
      elevationData,
      terrain,
      routeCoordinates,
      startLocation,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { username: req.user.name },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert duration from string to number of seconds
    const durationInSeconds = duration.split("m")[0] * 60;

    // Calculate average pace
    const averagePace = durationInSeconds / 60 / parseFloat(distance);

    const activity = await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: "Run",
        startDateTime: new Date(),
        duration: durationInSeconds,
        distance: parseFloat(distance),
        averagePace: averagePace,
        elevationGain: elevationData.gain,
        elevationLoss: elevationData.loss,
        caloriesBurned: calculateCaloriesBurned(
          user,
          distance,
          elevationData.gain
        ),
        startLatitude: routeCoordinates[0][1],
        startLongitude: routeCoordinates[0][0],
        endLatitude: routeCoordinates[routeCoordinates.length - 1][1],
        endLongitude: routeCoordinates[routeCoordinates.length - 1][0],
        routeCoordinates: JSON.stringify(routeCoordinates),
        startLocation,
      },
    });

    // Update relevant challenges
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        userId: user.id,
        isCompleted: false,
        endDate: { gte: new Date() },
      },
    });

    for (const challenge of activeChallenges) {
      const newProgress = challenge.currentProgress + parseFloat(distance);
      const isCompleted = newProgress >= challenge.target;
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: {
          currentProgress: newProgress,
          isCompleted: isCompleted,
        },
      });
    }

    res.json({
      activity,
      message: "Activity saved and challenges updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving activity and updating challenges",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Fetch an active run
app.get("/active-run/:runId", authenticateToken, async (req, res) => {
  try {
    const runId = parseInt(req.params.runId);
    const activeRun = await prisma.activeRun.findUnique({
      where: { id: runId },
    });

    if (!activeRun) {
      return res.status(404).json({ message: "Active run not found" });
    }

    // Check if the active run belongs to the authenticated user
    if (activeRun.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this run" });
    }

    res.json(activeRun);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching active run", error: error.message });
  }
});

// Start a new run
app.post("/start-run", authenticateToken, async (req, res) => {
  try {
    const {
      distance,
      elevationData,
      routeCoordinates,
      startLocation,
      duration,
    } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate average pace (minutes per mile)
    const durationMinutes = parseFloat(duration.split("m")[0]);
    const averagePace = durationMinutes / parseFloat(distance);

    // Calculate estimated calories burned
    const caloriesBurned = calculateCaloriesBurned(
      user,
      parseFloat(distance),
      elevationData.gain
    );

    const activeRun = await prisma.activeRun.create({
      data: {
        userId: user.id,
        startDateTime: new Date(),
        distance: parseFloat(distance),
        elevationGain: elevationData.gain,
        elevationLoss: elevationData.loss,
        startLatitude: routeCoordinates[0][1],
        startLongitude: routeCoordinates[0][0],
        endLatitude: routeCoordinates[routeCoordinates.length - 1][1],
        endLongitude: routeCoordinates[routeCoordinates.length - 1][0],
        routeCoordinates: JSON.stringify(routeCoordinates),
        startLocation,
        averagePace,
        estimatedCaloriesBurned: caloriesBurned,
      },
    });

    res.json(activeRun);
  } catch (error) {
    res.status(500).json({
      message: "Error starting run",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Complete a run
app.post("/complete-run/:runId", authenticateToken, async (req, res) => {
  try {
    const runId = parseInt(req.params.runId);
    const activeRun = await prisma.activeRun.findUnique({
      where: { id: runId },
      include: { user: true },
    });

    if (!activeRun) {
      return res.status(404).json({ message: "Active run not found" });
    }

    if (activeRun.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this run" });
    }

    // Calculate actual duration
    const actualDuration = Math.round(
      (new Date() - activeRun.startDateTime) / 1000
    ); // in seconds

    // Create UserActivity from completed run
    const userActivity = await prisma.userActivity.create({
      data: {
        userId: activeRun.userId,
        activityType: "Run",
        startDateTime: activeRun.startDateTime,
        duration: actualDuration,
        distance: activeRun.distance,
        averagePace: activeRun.averagePace,
        elevationGain: activeRun.elevationGain,
        elevationLoss: activeRun.elevationLoss,
        caloriesBurned: activeRun.estimatedCaloriesBurned,
        startLatitude: activeRun.startLatitude,
        startLongitude: activeRun.startLongitude,
        endLatitude: activeRun.endLatitude,
        endLongitude: activeRun.endLongitude,
        routeCoordinates: activeRun.routeCoordinates,
        startLocation: activeRun.startLocation,
      },
    });

    // Mark the ActiveRun as completed
    await prisma.activeRun.update({
      where: { id: runId },
      data: { isCompleted: true },
    });

    res.json({ message: "Run completed successfully", userActivity });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error completing run", error: error.message });
  }
});


// Create a new challenge
app.post("/challenges", authenticateToken, async (req, res) => {
  try {
    const { description, target, endDate } = req.body;
    const challenge = await prisma.challenge.create({
      data: {
        userId: req.user.id,
        description,
        target,
        endDate: new Date(endDate),
      },
    });
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

// Get user's challenges
app.get("/challenges", authenticateToken, async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { userId: req.user.id },
      orderBy: { endDate: "asc" },
    });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch challenges" });
  }
});


// Update challenge progress
app.put("/challenges/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentProgress, isCompleted } = req.body;
    const updatedChallenge = await prisma.challenge.update({
      where: { id: parseInt(id) },
      data: { currentProgress, isCompleted },
    });
    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ error: "Failed to update challenge" });
  }
});

// 3. Implement challenge generation function
// Updated challenge generation function
// Challenge generation function
const generateChallenge = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activities: { orderBy: { startDateTime: "desc" }, take: 5 },
        challenges: {
          where: { isCompleted: false },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user || user.activities.length === 0) {
      console.log(
        `No recent activities found for user ${userId}. Skipping challenge generation.`
      );
      return;
    }

    // Check if user already has an active challenge
    if (user.challenges.length > 0) {
      console.log(
        `User ${userId} already has an active challenge. Skipping generation.`
      );
      return;
    }

    const recentActivities = user.activities;
    const avgDistance =
      recentActivities.reduce((sum, activity) => sum + activity.distance, 0) /
      recentActivities.length;

    // Set a minimum challenge distance of 0.1 miles
    const challengeTarget = Math.max(
      Math.round(avgDistance * 0.2 * 10) / 10,
      0.1
    );
    const endDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const challenge = await prisma.challenge.create({
      data: {
        userId,
        description: `Quick challenge: Run ${challengeTarget.toFixed(
          1
        )} miles in the next 10 minutes`,
        target: challengeTarget,
        endDate,
      },
    });

    console.log(
      `Generated challenge for user ${userId}: ${challenge.description}`
    );
  } catch (error) {
    console.error(`Error generating challenge for user ${userId}:`, error);
  }
};


// 4. Add a cron job to generate challenges weekly (you'll need to install a cron library)

// Updated cron job to run every 2 minutes
// Cron job to generate challenges every 2 minutes
// In your cron job, you might want to clean up old, uncompleted challenges
cron.schedule('*/2 * * * *', async () => {
  console.log('Running challenge generation job');
  try {
    // Clean up old, uncompleted challenges
    await prisma.challenge.deleteMany({
      where: {
        isCompleted: false,
        endDate: { lt: new Date() }
      }
    });

    const users = await prisma.user.findMany();
    for (const user of users) {
      await generateChallenge(user.id);
    }
  } catch (error) {
    console.error('Error in challenge generation job:', error);
  }
});

// Cron job to generate challenges every 2 minutes
const challengeGenerationJob = cron.schedule('*/2 * * * *', async () => {
  console.log('Running challenge generation job');
  try {
    const users = await prisma.user.findMany();
    for (const user of users) {
      await generateChallenge(user.id);
    }
  } catch (error) {
    console.error('Error generating challenges:', error);
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    "Challenge generation cron job is set up and will run every 2 minutes"
  );
});
