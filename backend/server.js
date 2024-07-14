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
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// New endpoint to fetch user activities
app.get("/user-activities", authenticateToken, async (req, res) => {
  try {
    const activities = await prisma.userActivity.findMany({
      where: { userId: req.user.id },
      orderBy: { startDateTime: 'desc' },
      take: 10 // Limit to 10 most recent activities
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities", error: error.message });
  }
});

// Function to calculate calories burned based on user profile and route
const calculateCaloriesBurned = (user, distance, elevationGain) => {
  // This is a simplified calculation and should be refined for more accuracy
  const weight = user.weight * 0.453592; // Convert lbs to kg
  const duration = distance * 10; // Assume 10 minutes per mile
  const caloriesPerMinute = 0.0175 * 8 * weight; // MET value of 8 for running
  return Math.round(caloriesPerMinute * duration);
};

// New endpoint to save a route as a user activity
app.post("/save-route-activity", authenticateToken, async (req, res) => {
  try {
    const { distance, duration, elevationData, terrain, routeCoordinates, startLocation } = req.body;
    const user = await prisma.user.findUnique({ where: { username: req.user.name } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activity = await prisma.userActivity.create({
      data: {
        userId: user.id,
        activityType: 'Run',
        startDateTime: new Date(),
        duration: Math.round(duration * 60), // Convert to seconds
        distance: parseFloat(distance),
        averagePace: duration / distance, // minutes per mile
        elevationGain: elevationData.gain,
        elevationLoss: elevationData.loss,
        caloriesBurned: calculateCaloriesBurned(user, distance, elevationData.gain),
        startLatitude: routeCoordinates[0][1],
        startLongitude: routeCoordinates[0][0],
        endLatitude: routeCoordinates[routeCoordinates.length - 1][1],
        endLongitude: routeCoordinates[routeCoordinates.length - 1][0],
        routeCoordinates: JSON.stringify(routeCoordinates),
        startLocation,
      },
    });

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Error saving activity", error: error.message });
  }
});


app.listen(PORT, () => {});
