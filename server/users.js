const db = require("./db");

async function findUserByEmail(email) {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  } catch (err) {
    console.error("Error finding user:", err);
    throw err;
  }
}

async function addUser({ username, email, password }) {
  try {
    const [result] = await db.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password]
    );
    return { id: result.insertId, username, email, password };
  } catch (err) {
    console.error("Error adding user:", err);
    throw err;
  }
}

module.exports = { findUserByEmail, addUser };
