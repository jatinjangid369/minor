const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/auth");

// GET /api/mood/logs - Fetch mood logs for the authenticated user
router.get("/logs", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch last 30 days of logs for charts
        const [rows] = await db.execute(
            "SELECT * FROM mood_logs WHERE user_id = ? ORDER BY created_at ASC",
            [userId]
        );

        res.json({ status: "success", data: rows });
    } catch (err) {
        console.error("Error fetching mood logs:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// GET /api/mood/stats - Fetch aggregated stats for the dashboard
router.get("/stats", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get average mood
        const [avgRows] = await db.execute(
            "SELECT AVG(mood) as averageMood FROM mood_logs WHERE user_id = ?",
            [userId]
        );
        const averageMood = avgRows[0].averageMood || 0;

        // Get streak (simplified logic: count distinct days in last 7 days)
        // For a real streak, you'd need a more complex query or application logic
        const [streakRows] = await db.execute(
            "SELECT COUNT(DISTINCT DATE(created_at)) as days FROM mood_logs WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
            [userId]
        );
        const streakDays = streakRows[0].days;

        // Get mood distribution
        const [distRows] = await db.execute(
            "SELECT mood, COUNT(*) as count FROM mood_logs WHERE user_id = ? GROUP BY mood",
            [userId]
        );

        res.json({
            status: "success",
            data: {
                averageMood: parseFloat(averageMood).toFixed(1),
                streakDays,
                distribution: distRows
            }
        });

    } catch (err) {
        console.error("Error fetching mood stats:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// GET /api/mood/quiz/history - Fetch quiz history for the authenticated user
router.get("/quiz/history", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.execute(
            "SELECT id, score, mood_label as mood, answers, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as date FROM mood_quiz_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
            [userId]
        );

        // Format date to friendly string if needed, or keep as is
        // For chart, we might want "Today", "Yesterday", etc. or just the date
        // Let's do some basic formatting in JS if needed, or send raw date

        res.json({ status: "success", data: rows });
    } catch (err) {
        console.error("Error fetching quiz history:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// POST /api/mood/quiz - Save a new mood quiz result
router.post("/quiz", authenticateToken, async (req, res) => {
    const { score, moodLabel, answers } = req.body;
    const userId = req.user.id;

    if (score === undefined || !moodLabel) {
        return res.status(400).json({ status: "error", message: "Score and Mood Label are required" });
    }

    try {
        await db.execute(
            "INSERT INTO mood_quiz_results (user_id, score, mood_label, answers) VALUES (?, ?, ?, ?)",
            [userId, score, moodLabel, answers ? JSON.stringify(answers) : null]
        );
        res.status(201).json({ status: "success", message: "Quiz result saved successfully" });
    } catch (err) {
        console.error("Error saving quiz result:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

// POST /api/mood/log - Create a new mood log
router.post("/log", authenticateToken, async (req, res) => {
    const { mood, note } = req.body;
    const userId = req.user.id;

    if (!mood) {
        return res.status(400).json({ status: "error", message: "Mood rating is required" });
    }

    try {
        await db.execute(
            "INSERT INTO mood_logs (user_id, mood, note) VALUES (?, ?, ?)",
            [userId, mood, note || ""]
        );
        res.status(201).json({ status: "success", message: "Mood logged successfully" });
    } catch (err) {
        console.error("Error logging mood:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

module.exports = router;
