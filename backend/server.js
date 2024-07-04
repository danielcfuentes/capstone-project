require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const PORT = process.env.SERVER_PORT;

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
app.post("/posts", authenticateToken, async (req, res) => {
  const { title, content, imageUrls } = req.body;

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        updatedAt: null, // Ensure updatedAt is null when the post is created
        user: { connect: { username: req.user.name } },
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: { images: true },
    });

    res.status(201).json(newPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
});

// Get all posts from all users
app.get("/allposts", authenticateToken, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        images: true,
        user: {
          select: {
            username: true,
            // Add other user fields want to include, but NOT the password
          },
        },
      },
      orderBy: {
        createdAt: "desc", // This will sort posts from newest to oldest
      },
    });

    res.json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching all posts", error: error.message });
  }
});

app.listen(PORT, () => {});
