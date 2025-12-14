-- ============================================================
-- Database Creation
-- ============================================================

CREATE DATABASE IF NOT EXISTS mindful_u_db;
USE mindful_u_db;

-- ============================================================
-- Users Table
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Users
INSERT INTO users (username, email, password) VALUES
('testuser', 'test@example.com', 'password123'),
('demo', 'demo@example.com', 'demo123');

-- ============================================================
-- Mood Logs Table (for mood tracking + graph)
-- ============================================================

CREATE TABLE IF NOT EXISTS mood_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  mood INT NOT NULL,     -- 1=Very Sad, 2=Sad, 3=Neutral, 4=Happy, 5=Very Happy
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed Mood Logs (Sample Data Matching Your UI Graph)
INSERT INTO mood_logs (user_id, mood, note, created_at) VALUES
(1, 4, 'Good day!',        '2025-05-27 10:00:00'),  -- Happy
(1, 3, 'Bit stressed.',    '2025-05-28 10:00:00'),  -- Neutral
(1, 5, 'Fantastic mood!',  '2025-05-29 10:00:00'),  -- Very Happy
(1, 2, 'Not great today.', '2025-05-30 10:00:00'),  -- Sad
(1, 4, 'Feeling better.',  '2025-05-31 10:00:00');  -- Happy

-- ============================================================
-- Mood Journey Query (FOR REFERENCE ONLY, NOT EXECUTED IN SEED)
-- ============================================================

-- This is the query your backend will use to generate the graph:
-- SELECT 
--     DATE(created_at) AS date,
--     AVG(mood) AS average_mood
-- FROM mood_logs
-- WHERE user_id = 1
-- GROUP BY DATE(created_at)
-- ORDER BY DATE(created_at);
