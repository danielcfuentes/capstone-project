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
const cron = require("node-cron");

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
        likes: true,
        comments: true, // Include comments
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
      likeCount: post.likes.length,
      isLikedByUser: post.likes.some((like) => like.userId === req.user.id),
      commentCount: post.comments.length, // Add comment count
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


// Add a new endpoint for liking/unliking a post
app.post("/posts/:postId/like", authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: parseInt(postId),
          userId: userId,
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      res.json({ message: "Post unliked successfully" });
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          post: { connect: { id: parseInt(postId) } },
          user: { connect: { id: userId } },
        },
      });
      res.json({ message: "Post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating like", error: error.message });
  }
});

// Add a new endpoint for adding a comment to a post
app.post("/posts/:postId/comments", authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const newComment = await prisma.comment.create({
      data: {
        content,
        post: { connect: { id: parseInt(postId) } },
        user: { connect: { id: userId } },
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
});

// Add a new endpoint for fetching comments for a post
app.get("/posts/:postId/comments", authenticateToken, async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      include: {
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
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
});

//Profile ________________________

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
      runId,
      distance,
      duration,
      elevationData,
      routeCoordinates,
      startLocation,
    } = req.body;

    // Validate required fields
    if (
      !runId ||
      !distance ||
      !duration ||
      !routeCoordinates ||
      !startLocation
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await prisma.user.findUnique({
      where: { username: req.user.name },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for existing activity with the same runId
    const existingActivity = await prisma.userActivity.findUnique({
      where: { runId: runId },
    });

    if (existingActivity) {
      return res
        .status(409)
        .json({ message: "Activity already saved for this run" });
    }

    // Parse routeCoordinates if it's a string
    let parsedRouteCoordinates;
    try {
      parsedRouteCoordinates =
        typeof routeCoordinates === "string"
          ? JSON.parse(routeCoordinates)
          : routeCoordinates;
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Invalid routeCoordinates format" });
    }

    // Ensure parsedRouteCoordinates is an array and has at least one coordinate
    if (
      !Array.isArray(parsedRouteCoordinates) ||
      parsedRouteCoordinates.length === 0
    ) {
      return res.status(400).json({ message: "Invalid routeCoordinates data" });
    }

    const startCoordinate = parsedRouteCoordinates[0];
    const endCoordinate =
      parsedRouteCoordinates[parsedRouteCoordinates.length - 1];

    // Convert duration to seconds if it's not already
    const durationInSeconds =
      typeof duration === "string" ? parseInt(duration) : duration;

    // Calculate average pace
    const averagePace = durationInSeconds / 60 / parseFloat(distance);

    const activity = await prisma.userActivity.create({
      data: {
        runId,
        userId: user.id,
        activityType: "Run",
        startDateTime: new Date(),
        duration: durationInSeconds,
        distance: parseFloat(distance),
        averagePace: averagePace,
        elevationGain: elevationData?.gain || 0,
        elevationLoss: elevationData?.loss || 0,
        caloriesBurned: calculateCaloriesBurned(
          user,
          distance,
          elevationData?.gain || 0
        ),
        startLatitude: startCoordinate[1],
        startLongitude: startCoordinate[0],
        endLatitude: endCoordinate[1],
        endLongitude: endCoordinate[0],
        routeCoordinates: JSON.stringify(parsedRouteCoordinates),
        startLocation,
      },
    });

    const activeChallenges = await prisma.challenge.findMany({
      where: {
        userId: user.id,
        status: "active",
      },
    });

    for (const challenge of activeChallenges) {
      let newProgress = challenge.currentProgress;
      let isCompleted = false;

      switch (challenge.type) {
        case "first_run":
          isCompleted = true;
          break;
        case "distance":
          newProgress += activity.distance;
          isCompleted = newProgress >= challenge.target;
          break;
        case "calories":
          newProgress += activity.caloriesBurned;
          isCompleted = newProgress >= challenge.target;
          break;
        case "elevation":
          newProgress += activity.elevationGain;
          isCompleted = newProgress >= challenge.target;
          break;
      }

      await prisma.challenge.update({
        where: { id: challenge.id },
        data: {
          currentProgress: newProgress,
          status: isCompleted ? "completed" : "active",
        },
      });
    }

    res.json({
      message: "Activity saved and challenges updated successfully",
      activity,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error saving activity",
      error: error.message,
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

    const actualDuration = Math.round(
      (new Date() - activeRun.startDateTime) / 1000
    );

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
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
          runId: runId.toString(),
        },
      });

      // Update active challenges
      const activeChallenges = await prisma.challenge.findMany({
        where: {
          userId: activeRun.userId,
          status: "active",
        },
      });

      for (const challenge of activeChallenges) {
        let newProgress = challenge.currentProgress;
        let isCompleted = false;

        switch (challenge.type) {
          case "distance":
            newProgress += activeRun.distance;
            break;
          case "calories":
            newProgress += activeRun.estimatedCaloriesBurned;
            break;
          case "elevation":
            newProgress += activeRun.elevationGain;
            break;
        }

        isCompleted = newProgress >= challenge.target;

        await prisma.challenge.update({
          where: { id: challenge.id },
          data: {
            currentProgress: newProgress,
            status: isCompleted ? "completed" : "active",
          },
        });
      }

      // Mark the ActiveRun as completed
      await prisma.activeRun.update({
        where: { id: runId },
        data: { isCompleted: true },
      });

      return { userActivity, updatedChallenges: activeChallenges.length };
    });

    res.json({
      message: "Run completed successfully",
      userActivity: result.userActivity,
      updatedChallenges: result.updatedChallenges,
    });
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

    if (isCompleted) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          completedChallenges: {
            increment: 1,
          },
        },
      });
    }

    res.json(updatedChallenge);
  } catch (error) {
    res.status(500).json({ error: "Failed to update challenge" });
  }
});

// Challenge generation function
const generateChallenges = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { activities: { orderBy: { startDateTime: "desc" }, take: 5 } },
    });

    if (!user || user.activities.length === 0) {
      return null;
    }

    const recentActivities = user.activities;
    const avgDistance =
      recentActivities.reduce((sum, activity) => sum + activity.distance, 0) /
      recentActivities.length;
    const avgCalories =
      recentActivities.reduce(
        (sum, activity) => sum + activity.caloriesBurned,
        0
      ) / recentActivities.length;
    const avgElevation =
      recentActivities.reduce(
        (sum, activity) => sum + activity.elevationGain,
        0
      ) / recentActivities.length;

    const challengeTypes = ["distance", "calories", "elevation"];
    const shuffledTypes = challengeTypes.sort(() => Math.random() - 0.5);
    const challenges = [];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999); // Set to end of next day

    for (const type of shuffledTypes.slice(0, 3)) {
      let target, description;
      switch (type) {
        case "distance":
          target = Math.max(Math.round(avgDistance * 1.2 * 10) / 10, 1); // At least 1 mile
          description = `Run ${target.toFixed(1)} miles today`;
          break;
        case "calories":
          target = Math.round(avgCalories * 1.2);
          description = `Burn ${target} calories today`;
          break;
        case "elevation":
          target = Math.round(avgElevation * 1.2);
          description = `Gain ${target} feet of elevation today`;
          break;
      }

      const challenge = await prisma.challenge.create({
        data: {
          userId,
          type,
          description,
          target,
          endDate: tomorrow,
          expiresAt: tomorrow,
        },
      });

      challenges.push(challenge);
    }

    return challenges;
  } catch (error) {
    return null;
  }
};

//new endpoint to fetch all past challenges:
app.get("/past-challenges", authenticateToken, async (req, res) => {
  try {
    const pastChallenges = await prisma.challenge.findMany({
      where: {
        userId: req.user.id,
        status: { in: ["completed", "failed"] },
      },
      orderBy: { endDate: "desc" },
    });
    res.json(pastChallenges);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch past challenges" });
  }
});

app.post("/generate-challenges", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { challenges: { where: { status: "active" } } },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.challenges.length > 0) {
      return res.json({
        message: "User already has active challenges",
        challenges: user.challenges,
      });
    }

    const newChallenges = await generateChallenges(user.id);
    res.json({
      message: "New challenges generated",
      challenges: newChallenges,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate challenges" });
  }
});

/// Update cron job to run once a day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    // Mark expired challenges as failed
    await prisma.challenge.updateMany({
      where: {
        status: "active",
        expiresAt: { lt: new Date() },
      },
      data: {
        status: "failed",
      },
    });

    // Generate new challenges for all users
    const users = await prisma.user.findMany();
    for (const user of users) {
      await generateChallenges(user.id);
    }
  } catch (error) {}
});


//leaderboard
app.get("/leaderboard", authenticateToken, async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        completedChallenges: true,
        previousRanking: true,
        activities: {
          select: {
            distance: true,
          },
        },
      },
      orderBy: {
        completedChallenges: "desc",
      },
    });

    const leaderboardData = allUsers.map((user, index) => {
      const currentRank = index + 1;
      let trend = 0;

      if (user.previousRanking) {
        trend = user.previousRanking - currentRank;
      }

      return {
        rank: currentRank,
        username: user.username,
        completedChallenges: user.completedChallenges,
        totalDistance: user.activities
          .reduce((sum, activity) => sum + activity.distance, 0)
          .toFixed(2),
        isCurrentUser: user.username === req.user.name,
        trend: trend,
      };
    });

    const currentUserRank =
      leaderboardData.findIndex((user) => user.isCurrentUser) + 1;

    // Update previous rankings less frequently
    const shouldUpdateRankings = await shouldUpdateLeaderboardRankings();
    if (shouldUpdateRankings) {
      await Promise.all(
        leaderboardData.map(async (user) => {
          await prisma.user.update({
            where: { username: user.username },
            data: { previousRanking: user.rank },
          });
        })
      );
      await updateLastLeaderboardUpdate();
    }

    res.json({
      leaderboard: leaderboardData,
      currentUserRank: currentUserRank,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Helper functions to manage leaderboard updates
async function shouldUpdateLeaderboardRankings() {
  const lastUpdate = await prisma.systemSetting.findUnique({
    where: { key: "lastLeaderboardUpdate" },
  });

  if (!lastUpdate) return true;

  const now = new Date();
  const lastUpdateTime = new Date(lastUpdate.value);
  const hoursSinceLastUpdate = (now - lastUpdateTime) / (1000 * 60 * 60);

  return hoursSinceLastUpdate >= 1; // Update once per day (currenlty have it for less for testing)
}

async function updateLastLeaderboardUpdate() {
  await prisma.systemSetting.upsert({
    where: { key: "lastLeaderboardUpdate" },
    update: { value: new Date().toISOString() },
    create: { key: "lastLeaderboardUpdate", value: new Date().toISOString() },
  });
}

// Start the server and log that the cron job is set up
app.listen(PORT, () => {});
