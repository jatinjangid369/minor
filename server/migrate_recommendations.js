const db = require("./db");

async function migrate() {
    try {
        console.log("Starting migrations...");

        await db.query(`
            CREATE TABLE IF NOT EXISTS exercise_recommendations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                recommendation JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log("✅ Table 'exercise_recommendations' created or already exists.");

        await db.query(`
            CREATE TABLE IF NOT EXISTS nutrition_recommendations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                recommendation JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        console.log("✅ Table 'nutrition_recommendations' created or already exists.");

        console.log("Migrations completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    }
}

migrate();
