const db = require("./db");

async function migrate() {
    try {
        console.log("Starting activity table migrations...");

        // Exercise Logs
        await db.query(`
            CREATE TABLE IF NOT EXISTS exercise_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                exercise_name VARCHAR(255) NOT NULL,
                type VARCHAR(50),
                duration VARCHAR(50),
                difficulty VARCHAR(50),
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log("✅ Table 'exercise_logs' created.");

        // Nutrition Logs
        await db.query(`
            CREATE TABLE IF NOT EXISTS nutrition_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                food VARCHAR(255) NOT NULL,
                category VARCHAR(50),
                mood_impact VARCHAR(50),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log("✅ Table 'nutrition_logs' created.");

        console.log("Activity tables migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
