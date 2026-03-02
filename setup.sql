-- RapidTechPro Admin Database Setup
-- Run this SQL file in your MySQL client to initialize the database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS rapidtechpro_admin;
USE rapidtechpro_admin;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (if not already exists)
-- Email: admin@company.com
-- Password: Admin@123
INSERT INTO admin_users (email, password) 
VALUES ('admin@company.com', 'Admin@123')
ON DUPLICATE KEY UPDATE email = email;

-- Verify the data was inserted
SELECT 'Admin user setup complete!' as status;
SELECT * FROM admin_users;
