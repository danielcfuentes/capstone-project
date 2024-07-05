require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();
const PORT = process.env.AUTH_PORT;
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());

// Refresh token endpoint
app.post("/token", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  const tokenRecord = await prisma.token.findFirst({
    where: { refreshToken },
  });
  if (!tokenRecord) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken });
  });
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { username },
    include: { tokens: true },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(401).json({ message: "Invalid password" });
  const accessToken = generateAccessToken({ name: username });
  const refreshToken = jwt.sign(
    { name: username },
    process.env.REFRESH_TOKEN_SECRET
  );
  await prisma.token.create({
    data: {
      refreshToken,
      user: { connect: { username } },
    },
  });
  res.json({ accessToken, refreshToken });
});

// Registration endpoint
app.post("/create", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      return res
        .status(409) // Changed from 400 to 409
        .json({
          message:
            "User already exists. Please try a different username or log in.",
        });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    res.status(201).json({ message: "User created successfully" }); // Added status 201 for successful creation
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create account. Please try again." });
  }
});

// Logout endpoint
app.delete("/logout", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "Token is required" });
  }
  try {
    const tokenRecord = await prisma.token.findFirst({
      where: { refreshToken },
    });

    if (!tokenRecord) {
      return res.status(404).json({ message: "Token not found" });
    }
    await prisma.token.delete({
      where: { id: tokenRecord.id },
    });
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "30min",
  });
}

app.listen(PORT, () => {});
