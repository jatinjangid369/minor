const db = require("./db");

async function checkData() {
    try {
        const [exerciseRecs] = await db.query("SELECT COUNT(*) as count FROM exercise_recommendations");
        const [nutritionRecs] = await db.query("SELECT COUNT(*) as count FROM nutrition_recommendations");
        const [exerciseLogs] = await db.query("SELECT COUNT(*) as count FROM exercise_logs");
        const [nutritionLogs] = await db.query("SELECT COUNT(*) as count FROM nutrition_logs");

        console.log("Current Data Counts:");
        console.log("- Exercise Recommendations:", exerciseRecs[0].count);
        console.log("- Nutrition Recommendations:", nutritionRecs[0].count);
        console.log("- Exercise Logs:", exerciseLogs[0].count);
        console.log("- Nutrition Logs:", nutritionLogs[0].count);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error checking data:", err.message);
        process.exit(1);
    }
}

checkData();
