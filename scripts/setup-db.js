#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates admin user in the database
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
  });

  try {
    console.log('📦 Setting up database...\n');

    // Create database
    console.log('1. Creating database...');
    await connection.execute(
      'CREATE DATABASE IF NOT EXISTS rapidtechpro_admin'
    );
    console.log('   ✓ Database created\n');

    // Select database
    await connection.execute('USE rapidtechpro_admin');

    // Create table
    console.log('2. Creating admin_users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✓ Table created\n');

    // Check if admin user exists
    console.log('3. Checking for existing admin user...');
    const [users] = await connection.execute(
      "SELECT * FROM admin_users WHERE email = ?",
      ['admin@company.com']
    );

    if (users.length > 0) {
      console.log('   ✓ Admin user already exists\n');
      console.log('📝 Existing admin credentials:');
      console.log('   Email: admin@company.com');
      console.log('   Password: Admin@123\n');
    } else {
      // Insert admin user
      console.log('   Admin user not found. Creating...');
      await connection.execute(
        'INSERT INTO admin_users (email, password) VALUES (?, ?)',
        ['admin@company.com', 'Admin@123']
      );
      console.log('   ✓ Admin user created\n');
      console.log('📝 New admin credentials:');
      console.log('   Email: admin@company.com');
      console.log('   Password: Admin@123\n');
    }

    console.log('✅ Database setup completed successfully!\n');
    console.log('You can now login with:');
    console.log('   Email: admin@company.com');
    console.log('   Password: Admin@123\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupDatabase();
