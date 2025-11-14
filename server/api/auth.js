const express = require("express");
const jwt = require("jsonwebtoken");
const { findUserByEmail, addUser } = require("../users");

const router = express.Router();

// Secret key for JWT (keep in .env in production)
const JWT_SECRET = "your_jwt_secret";
const JWT_EXPIRES_IN = "1h";

// Helper to generate token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Middleware to validate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ status: "error", message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ status: "error", message: "Invalid token" });
    req.user = user; // attach decoded user info
    next();
  });
}

// Signup
router.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ status: "error", message: "All fields are required" });
  }

  if (findUserByEmail(email)) {
    return res.status(400).json({ status: "error", message: "Email already registered" });
  }

  const user = addUser({ username, email, password });
  const token = generateToken(user);

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: { id: user.id, username: user.username, email: user.email },
    token
  });
});

// Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "error", message: "Email and password are required" });
  }

  const user = findUserByEmail(email);
    console.log(user);
  if (!user || user.password !== password) {
    return res.status(401).json({ status: "error", message: "Invalid email or password" });
  }

  const token = generateToken(user);

  res.status(200).json({
    status: "success",
    message: "Login successful",
    data: { id: user.id, username: user.username, email: user.email },
    token
  });
});

// Validate token (frontend calls this on page reload)
router.get("/validate", authenticateToken, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Token valid",
    data: { id: req.user.id, username: req.user.username, email: req.user.email }
  });
});

module.exports = router;
