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
-- Mood Quiz Results Table
-- ============================================================

CREATE TABLE IF NOT EXISTS mood_quiz_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  score INT NOT NULL,     -- Percentage score (0-100)
  mood_label VARCHAR(50), -- e.g. "Excellent", "Good", etc.
  answers JSON,           -- Store individual answers e.g. [{"q":1, "v":2}, ...]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed Mood Quiz Results
INSERT INTO mood_quiz_results (user_id, score, mood_label, answers, created_at) VALUES
(1, 85, 'Excellent', '[{"q":1, "v":5}, {"q":2, "v":4}, {"q":3, "v":4}, {"q":4, "v":4}, {"q":5, "v":4}]', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(1, 65, 'Great',    '[{"q":1, "v":3}, {"q":2, "v":3}, {"q":3, "v":3}, {"q":4, "v":3}, {"q":5, "v":4}]', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 45, 'Good',     '[{"q":1, "v":2}, {"q":2, "v":2}, {"q":3, "v":2}, {"q":4, "v":3}, {"q":5, "v":2}]', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 25, 'Okay',     '[{"q":1, "v":1}, {"q":2, "v":1}, {"q":3, "v":1}, {"q":4, "v":1}, {"q":5, "v":1}]', DATE_SUB(NOW(), INTERVAL 3 DAY));

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
