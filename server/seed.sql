-- Database Creation
CREATE DATABASE IF NOT EXISTS mindful_u_db;
USE mindful_u_db;

-- Table Structure for table `users`
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dump data for table `users`
INSERT INTO users (username, email, password) VALUES
('testuser', 'test@example.com', 'password123'),
('demo', 'demo@example.com', 'demo123');
