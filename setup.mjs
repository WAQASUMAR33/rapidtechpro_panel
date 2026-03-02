#!/usr/bin/env node

/**
 * Database Setup - Create Admin User
 * Run with: node setup.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('\n🚀 Setting up RapidTechPro Database...\n');

    // Check if admin user exists
    console.log('📋 Checking for existing admin user...');
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: 'admin@company.com' },
    }).catch(() => null);

    if (existingAdmin) {
      console.log('✅ Admin user already exists!\n');
      console.log('📝 Login Credentials:');
      console.log('   Email: admin@company.com');
      console.log('   Password: Admin@123\n');
      console.log('🔗 Access here: http://localhost:3000\n');
      return;
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await prisma.adminUser.create({
      data: {
        email: 'admin@company.com',
        password: 'Admin@123',
      },
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log(`   ID: ${admin.id}`);
    console.log('   Email: admin@company.com');
    console.log('   Password: Admin@123\n');
    console.log('🔗 Access here: http://localhost:3000\n');
    console.log('✨ Setup complete! You can now login.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure MySQL is running');
    console.error('  2. Check DATABASE_URL in .env.local');
    console.error('  3. Ensure database exists: CREATE DATABASE rapidtechpro_admin;\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
