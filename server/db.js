const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "mindful_u_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Test connection if run directly
if (require.main === module) {
    (async () => {
        try {
            const [rows] = await promisePool.query("SELECT 1");
            console.log("✅ Database connection successful!");
            process.exit(0);
        } catch (err) {
            console.error("❌ Database connection failed:", err.message);
            process.exit(1);
        }
    })();
}

module.exports = promisePool;

