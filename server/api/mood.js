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

        // 1. Weekly Data (Last 7 Days)
        const [weeklyRows] = await db.execute(`
            SELECT 
                DATE(created_at) as dateObj,
                DAYNAME(created_at) as dayName,
                AVG(mood) as avgMood,
                AVG(energy) as avgEnergy
            FROM mood_logs 
            WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY DATE(created_at), DAYNAME(created_at)
            ORDER BY DATE(created_at) ASC
        `, [userId]);

        // Map database results to UI format (Mon-Sun), filling gaps if necessary?
        // UI expects: { day: "Mon", mood: 4, energy: 3 }
        // We'll normalize to short day names
        const dayMap = { "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed", "Thursday": "Thu", "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun" };

        // Populate last 7 days including empty ones for a complete chart
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = weeklyRows.find(r => r.dateObj.toISOString().split('T')[0] === dateStr);

            weeklyData.push({
                day: dayMap[d.toLocaleDateString('en-US', { weekday: 'long' })],
                mood: found ? parseFloat(found.avgMood) : 0,
                energy: found ? parseFloat(found.avgEnergy || 0) : 0
            });
        }

        // 2. Average Mood (All time or last 30 days? UI usually implies recent context, let's do Last 30 Days for relevancy)
        const [avgRows] = await db.execute(
            "SELECT AVG(mood) as averageMood FROM mood_logs WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
            [userId]
        );
        const averageMood = parseFloat(avgRows[0].averageMood || 0);

        // 3. Trend (Current Week vs Previous Week)
        const [currentWeek] = await db.execute(
            "SELECT AVG(mood) as val FROM mood_logs WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
            [userId]
        );
        const [prevWeek] = await db.execute(
            "SELECT AVG(mood) as val FROM mood_logs WHERE user_id = ? AND created_at BETWEEN DATE_SUB(NOW(), INTERVAL 14 DAY) AND DATE_SUB(NOW(), INTERVAL 7 DAY)",
            [userId]
        );

        const currVal = parseFloat(currentWeek[0].val || 0);
        const prevVal = parseFloat(prevWeek[0].val || 0);
        let moodTrend = "+0.0";
        if (prevVal > 0) {
            const diff = currVal - prevVal;
            moodTrend = (diff > 0 ? "+" : "") + diff.toFixed(1);
        } else if (currVal > 0) {
            moodTrend = "+" + currVal.toFixed(1); // First week
        }

        // 4. Streak (Count consecutive days backwards from today)
        // Simplified SQL for current consecutive streak is hard, let's fetch dates and calc in JS
        const [datesRows] = await db.execute(
            "SELECT DISTINCT DATE(created_at) as dateStr FROM mood_logs WHERE user_id = ? ORDER BY dateStr DESC LIMIT 30",
            [userId]
        );

        let streakDays = 0;
        if (datesRows.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // Check if user logged today or yesterday to keep streak alive
            const latest = datesRows[0].dateStr.toISOString().split('T')[0];
            if (latest === today || latest === yesterday) {
                streakDays = 1;
                let currentCheck = new Date(latest);

                for (let i = 1; i < datesRows.length; i++) {
                    const prevDate = new Date(datesRows[i].dateStr);
                    const expectedPrev = new Date(currentCheck);
                    expectedPrev.setDate(expectedPrev.getDate() - 1);

                    if (prevDate.toISOString().split('T')[0] === expectedPrev.toISOString().split('T')[0]) {
                        streakDays++;
                        currentCheck = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        // 5. Distribution (Last 30 days)
        const [distRows] = await db.execute(
            "SELECT mood, COUNT(*) as count FROM mood_logs WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY mood",
            [userId]
        );

        const totalLogs = distRows.reduce((sum, r) => sum + r.count, 0);
        const moodColors = { 1: "#ef4444", 2: "#f97316", 3: "#f59e0b", 4: "#10b981", 5: "#8b5cf6" };
        const moodNames = { 1: "Very Sad", 2: "Sad", 3: "Neutral", 4: "Happy", 5: "Very Happy" };

        const moodDistribution = distRows.map(r => ({
            name: moodNames[r.mood],
            value: Number(((r.count / totalLogs) * 100).toFixed(0)), // Percentage
            color: moodColors[r.mood]
        }));

        // Fill missing moods for complete pie chart? Or just show present ones. UI usually shows all or main ones.
        // Let's stick to present ones for now, but sort them?
        moodDistribution.sort((a, b) => b.value - a.value);


        // 6. Insights Generation
        const insights = [];

        // Insight 1: Pattern (Weekend vs Weekday)
        const [weekendAvg] = await db.execute("SELECT AVG(mood) as val FROM mood_logs WHERE user_id = ? AND DAYOFWEEK(created_at) IN (1, 7)", [userId]);
        const [weekdayAvg] = await db.execute("SELECT AVG(mood) as val FROM mood_logs WHERE user_id = ? AND DAYOFWEEK(created_at) NOT IN (1, 7)", [userId]);

        const wEnd = parseFloat(weekendAvg[0].val || 0);
        const wDay = parseFloat(weekdayAvg[0].val || 0);

        if (wEnd > wDay + 0.5) {
            insights.push({
                title: "Your mood tends to be higher on weekends",
                description: "Consider incorporating more weekend-like activities during weekdays",
                type: "pattern"
            });
        } else if (wDay > wEnd + 0.5) {
            insights.push({
                title: "You seem happier during the week",
                description: "You might find purpose and joy in your daily routine!",
                type: "pattern"
            });
        }

        // Insight 2: Streak Achievement
        if (streakDays >= 3) {
            insights.push({
                title: "You've been consistent with tracking",
                description: `Great job maintaining this healthy habit for ${streakDays} days!`,
                type: "achievement"
            });
        }

        // Insight 3: Dip Detection (Lowest day of week)
        // Find day with lowest average mood in last 30 days
        const [lowestDay] = await db.execute(`
            SELECT DAYNAME(created_at) as dayName, AVG(mood) as val 
            FROM mood_logs 
            WHERE user_id = ? 
            GROUP BY DAYNAME(created_at) 
            ORDER BY val ASC 
            LIMIT 1`,
            [userId]
        );

        if (lowestDay.length > 0 && lowestDay[0].val < 3.0) {
            insights.push({
                title: `${lowestDay[0].dayName} dip noticed`,
                description: `${lowestDay[0].dayName} seems challenging. Try planning something enjoyable.`,
                type: "suggestion"
            });
        }

        // Fill up to 3 insights if needed
        if (insights.length === 0) {
            insights.push({
                title: "Keep tracking!",
                description: "More data will help uncover patterns in your mood.",
                type: "suggestion"
            });
        }

        res.json({
            status: "success",
            data: {
                averageMood: averageMood.toFixed(1),
                moodTrend,
                streakDays,
                weeklyData,
                moodDistribution,
                insights: insights.slice(0, 3) // Return top 3
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
    const { mood, energy, note } = req.body; // Added energy
    const userId = req.user.id;

    if (!mood) {
        return res.status(400).json({ status: "error", message: "Mood rating is required" });
    }

    try {
        await db.execute(
            "INSERT INTO mood_logs (user_id, mood, energy, note) VALUES (?, ?, ?, ?)", // Added energy
            [userId, mood, energy || 3, note || ""] // Default energy to 3 if missing
        );
        res.status(201).json({ status: "success", message: "Mood logged successfully" });
    } catch (err) {
        console.error("Error logging mood:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
});

module.exports = router;
