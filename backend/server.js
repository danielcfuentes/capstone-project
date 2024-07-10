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


// Recommend

// Endpoint to recommend a running plan based on user data and goals
app.post("/api/recommend-plan", authenticateToken, async (req, res) => {
  try {
    // Extract preferred distance and goal time from the request body
    const { preferredDistance, goalTime } = req.body;

    // Fetch user data from the database using Prisma ORM
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, // Use the authenticated user's ID
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
          where: { isCompleted: false }, // Only consider incomplete goals
          orderBy: { createdAt: "desc" }, // Get the most recent goal
          take: 1, // Limit to one result
          select: { goalType: true, targetValue: true }, // Select goal type and target value
        },
      },
    });

    // If user is not found, return a 404 status with an error message
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the latest goal from the user's running goals
    const latestGoal = user.runningGoals[0];

    // Estimate the user's weekly mileage based on their latest goal
    const estimatedWeeklyMileage = latestGoal
      ? estimateWeeklyMileage(
          latestGoal.goalType, // Type of goal (distance or time)
          latestGoal.targetValue, // Target value for the goal
          user.fitnessLevel // User's fitness level
        )
      : 0; // Default to 0 if no goals are found

    // Construct a full user profile with all necessary data
    const fullUserProfile = {
      fitnessLevel: user.fitnessLevel || "Beginner", // Default to "Beginner" if not specified
      runningExperience: user.runningExperience || "Novice", // Default to "Novice" if not specified
      weeklyMileage: estimatedWeeklyMileage, // Use the estimated weekly mileage
      preferredDistance, // Use preferred distance from request body
      goalTime, // Use goal time from request body
      weight: user.weight, // User's weight
      height: user.height, // User's height
      age: user.age, // User's age
      gender: user.gender, // User's gender
      preferredTerrains: user.preferredTerrains, // User's preferred terrains
      healthConditions: user.healthConditions, // User's health conditions
    };

    // Get a recommended running plan based on the full user profile
    const recommendedPlan = recommendPlan(fullUserProfile);

    // If a suitable plan is found, return it as a JSON response
    if (recommendedPlan) {
      res.json({ recommendedPlan });
    } else {
      // If no suitable plan is found, return a 404 status with an error message
      res.status(404).json({ message: "No suitable plan found" });
    }
  } catch (error) {
    // Log the error to the console and return a 500 status with an error message
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

app.listen(PORT, () => {});
