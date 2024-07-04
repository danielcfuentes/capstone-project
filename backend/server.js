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
const upload = multer({ storage: multer.memoryStorage() });

app.post(
  "/posts",
  authenticateToken,
  upload.array("images"),
  async (req, res) => {
    const { title, content } = req.body;
    const images = req.files;

    try {
      const newPost = await prisma.post.create({
        data: {
          title,
          content,
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
      res.status(500).json({ error: "Failed to create post" });
    }
  }
);

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
