const db = require("./db");

async function migrate() {
    try {
        console.log("Checking for energy column...");
        // Check if column exists
        const [columns] = await db.execute("SHOW COLUMNS FROM mood_logs LIKE 'energy'");

        if (columns.length === 0) {
            console.log("Adding energy column...");
            await db.execute("ALTER TABLE mood_logs ADD COLUMN energy INT DEFAULT 3 AFTER mood");
            console.log("✅ energy column added successfully.");
        } else {
            console.log("ℹ️ energy column already exists.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();
