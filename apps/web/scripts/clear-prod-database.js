#!/usr/bin/env node

/**
 * Script to clear all data from the PRODUCTION database while keeping the schema intact
 * Uses PROD_DATABASE_URL environment variable
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL
    }
  }
});

async function clearProductionDatabase() {
  console.log('🗑️  Clearing PRODUCTION database...');
  console.log('⚠️  WARNING: You are about to clear the PRODUCTION database!');
  console.log('This will delete ALL data including:');
  console.log('- All users and their credentials');
  console.log('- All stories and audio files');
  console.log('- All demographics data');
  console.log('- All crisis intervention logs');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Delete in correct order to respect foreign key constraints
    console.log('Deleting crisis intervention logs...');
    const crisisLogs = await prisma.crisisInterventionLog.deleteMany({});
    console.log(`✓ Deleted ${crisisLogs.count} crisis intervention logs`);

    console.log('Deleting moderation logs...');
    const modLogs = await prisma.moderationLog.deleteMany({});
    console.log(`✓ Deleted ${modLogs.count} moderation logs`);

    console.log('Deleting stories...');
    const stories = await prisma.story.deleteMany({});
    console.log(`✓ Deleted ${stories.count} stories`);

    console.log('Deleting user demographics...');
    const demographics = await prisma.userDemographics.deleteMany({});
    console.log(`✓ Deleted ${demographics.count} demographic records`);

    console.log('Deleting users...');
    const users = await prisma.user.deleteMany({});
    console.log(`✓ Deleted ${users.count} users`);

    console.log('Deleting admins...');
    const admins = await prisma.admin.deleteMany({});
    console.log(`✓ Deleted ${admins.count} admins`);

    console.log('\n✅ Production database cleared successfully!');
    console.log('The schema remains intact and ready for new data.');
    
  } catch (error) {
    console.error('❌ Error clearing production database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearProductionDatabase();