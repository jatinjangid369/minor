const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/auth");

// POST /api/activity/exercise - Log a completed exercise
router.post("/exercise", authenticateToken, async (req, res) => {
    const { name, type, duration, difficulty } = req.body;
    const userId = req.user.id;

    try {
        await db.execute(
            "INSERT INTO exercise_logs (user_id, exercise_name, type, duration, difficulty) VALUES (?, ?, ?, ?, ?)",
            [userId, name, type, duration, difficulty]
        );
        res.status(201).json({ status: "success", message: "Exercise logged successfully" });
    } catch (err) {
        console.error("Error logging exercise:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// GET /api/activity/exercises - Fetch exercise logs
router.get("/exercises", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute(
            "SELECT * FROM exercise_logs WHERE user_id = ? ORDER BY completed_at DESC",
            [userId]
        );
        res.json({ status: "success", data: rows });
    } catch (err) {
        console.error("Error fetching exercises:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// POST /api/activity/nutrition - Log a food entry
router.post("/nutrition", authenticateToken, async (req, res) => {
    const { food, category, moodImpact, notes } = req.body;
    const userId = req.user.id;

    try {
        await db.execute(
            "INSERT INTO nutrition_logs (user_id, food, category, mood_impact, notes) VALUES (?, ?, ?, ?, ?)",
            [userId, food, category, moodImpact, notes || ""]
        );
        res.status(201).json({ status: "success", message: "Food logged successfully" });
    } catch (err) {
        console.error("Error logging nutrition:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// GET /api/activity/nutrition - Fetch nutrition logs
router.get("/nutrition", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute(
            "SELECT * FROM nutrition_logs WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
        res.json({ status: "success", data: rows });
    } catch (err) {
        console.error("Error fetching nutrition:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

module.exports = router;
