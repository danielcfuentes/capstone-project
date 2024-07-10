require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const PORT = process.env.SERVER_PORT;
const multer = require("multer");
const { recommendPlan } = require("./utils/planRecommendation")
const runningPlans = require("./data/runningPlans");

app.use(express.json());
app.use(cors());

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
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
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Recommend

// Endpoint to recommend a running plan based on user data and goals
app.post("/api/recommend-plan", authenticateToken, async (req, res) => {
  try {
    const { preferredDistance, goalTime } = req.body;

    const user = await prisma.user.findUnique({
      where: { username: req.user.name },
      select: {
        fitnessLevel: true,
        runningExperience: true,
        weight: true,
        height: true,
        age: true,
        gender: true,
        preferredTerrains: true,
        healthConditions: true,
        runningGoals: {
          where: { isCompleted: false },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { goalType: true, targetValue: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const latestGoal = user.runningGoals[0];
    const estimatedWeeklyMileage = latestGoal
      ? estimateWeeklyMileage(
          latestGoal.goalType,
          latestGoal.targetValue,
          user.fitnessLevel
        )
      : 0;

    const fullUserProfile = {
      fitnessLevel: user.fitnessLevel || "Beginner",
      runningExperience: user.runningExperience || "Novice",
      weeklyMileage: estimatedWeeklyMileage,
      preferredDistance,
      goalTime,
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      preferredTerrains: user.preferredTerrains || [],
      healthConditions: user.healthConditions || [],
    };

    console.log("User profile for recommendation:", fullUserProfile);

    const recommendedPlan = recommendPlan(fullUserProfile);

    if (recommendedPlan) {
      res.json({ recommendedPlan });
    } else {
      res.status(404).json({ message: "No suitable plan found" });
    }
  } catch (error) {
    console.error("Error recommending plan:", error);
    res.status(500).json({ message: "Error recommending plan" });
  }
});

// Function to estimate the user's weekly mileage based on their goal and fitness level
function estimateWeeklyMileage(goalType, targetValue, fitnessLevel) {
  let baseEstimate;
  // Calculate the base estimate of weekly mileage based on goal type
  switch (goalType) {
    case "distance":
      baseEstimate = targetValue * 0.3; // Assume 30% of the goal distance is the weekly mileage
      break;
    case "time":
      // Assume the goal is in minutes and use a rough estimate of 1km per 6 minutes (10km/h pace)
      baseEstimate = (targetValue / 6) * 0.3; // 30% of the estimated distance
      break;
    default:
      return 0; // Return 0 if the goal type is not recognized
  }

  // Adjust the base estimate based on the user's fitness level
  switch (fitnessLevel.toLowerCase()) {
    case "beginner":
      return baseEstimate * 0.8; // Reduce estimate for beginners
    case "intermediate":
      return baseEstimate; // No adjustment for intermediate
    case "advanced":
      return baseEstimate * 1.2; // Increase estimate for advanced users
    default:
      return baseEstimate; // Default to base estimate if fitness level is not recognized
  }
}

app.get("/api/all-plans", authenticateToken, (req, res) => {
  try {
    res.json({ plans: runningPlans });
  } catch (error) {
    console.error("Error fetching all plans:", error);
    res.status(500).json({ message: "Error fetching all plans" });
  }
});



app.listen(PORT, () => {});
