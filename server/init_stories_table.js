
const db = require('./db');
require('dotenv').config();

async function init() {
    try {
        console.log('Initializing story_recommendations table...');

        await db.execute(`
      CREATE TABLE IF NOT EXISTS story_recommendations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        recommendation JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

        console.log('Table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    }
}

init();
