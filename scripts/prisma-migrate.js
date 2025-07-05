#!/usr/bin/env node

/**
 * Prisma-based Database Migration
 * Migrates data between Neon branches using Prisma
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const DEV_URL = process.env.DATABASE_URL_DEV || process.env.DATABASE_URL
const PROD_URL = process.env.DATABASE_URL_PROD || process.env.PROD_DATABASE_URL

if (!DEV_URL || !PROD_URL) {
  console.error('Error: DATABASE_URL_DEV and DATABASE_URL_PROD must be set')
  console.error('Example:')
  console.error('  DATABASE_URL_DEV=postgresql://user:pass@host/db')
  console.error('  DATABASE_URL_PROD=postgresql://user:pass@host/db')
  process.exit(1)
}

// Create Prisma clients for both databases
const devPrisma = new PrismaClient({
  datasources: {
    db: { url: DEV_URL }
  }
})

const prodPrisma = new PrismaClient({
  datasources: {
    db: { url: PROD_URL }
  }
})

async function migrate() {
  console.log('=== Prisma Database Migration ===')
  console.log('Source: Development')
  console.log('Target: Production')
  console.log('')
  
  try {
    // Test connections
    console.log('Testing connections...')
    await devPrisma.$connect()
    await prodPrisma.$connect()
    console.log('✓ Connections established')
    console.log('')
    
    // Get counts before migration
    console.log('Current state:')
    const devUserCount = await devPrisma.user.count()
    const devStoryCount = await devPrisma.story.count()
    const prodUserCount = await prodPrisma.user.count()
    const prodStoryCount = await prodPrisma.story.count()
    
    console.log(`  Dev:  ${devUserCount} users, ${devStoryCount} stories`)
    console.log(`  Prod: ${prodUserCount} users, ${prodStoryCount} stories`)
    console.log('')
    
    // Migrate Users
    console.log('1. Migrating Users...')
    const users = await devPrisma.user.findMany({
      include: {
        demographics: true
      }
    })
    
    for (const user of users) {
      try {
        // Delete existing user if present
        await prodPrisma.user.delete({ where: { id: user.id } }).catch(() => {})
        
        // Create user
        const { demographics, ...userData } = user
        await prodPrisma.user.create({
          data: userData
        })
        
        // Create demographics if exists
        if (demographics) {
          await prodPrisma.userDemographics.create({
            data: demographics
          })
        }
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate user ${user.username}:`, error.message)
      }
    }
    console.log(`  ✓ Migrated ${users.length} users`)
    console.log('')
    
    // Migrate Stories
    console.log('2. Migrating Stories...')
    const stories = await devPrisma.story.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    for (const story of stories) {
      try {
        // Delete existing story if present
        await prodPrisma.story.delete({ where: { id: story.id } }).catch(() => {})
        
        // Create story
        await prodPrisma.story.create({
          data: story
        })
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate story ${story.id}:`, error.message)
      }
    }
    console.log(`  ✓ Migrated ${stories.length} stories`)
    console.log('')
    
    // Migrate Crisis Intervention Logs
    console.log('3. Migrating Crisis Intervention Logs...')
    const crisisLogs = await devPrisma.crisisInterventionLog.findMany()
    
    for (const log of crisisLogs) {
      try {
        await prodPrisma.crisisInterventionLog.delete({ where: { id: log.id } }).catch(() => {})
        await prodPrisma.crisisInterventionLog.create({ data: log })
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate crisis log ${log.id}:`, error.message)
      }
    }
    console.log(`  ✓ Migrated ${crisisLogs.length} crisis logs`)
    console.log('')
    
    // Migrate Moderation Logs
    console.log('4. Migrating Moderation Logs...')
    const modLogs = await devPrisma.moderationLog.findMany()
    
    for (const log of modLogs) {
      try {
        await prodPrisma.moderationLog.delete({ where: { id: log.id } }).catch(() => {})
        await prodPrisma.moderationLog.create({ data: log })
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate moderation log ${log.id}:`, error.message)
      }
    }
    console.log(`  ✓ Migrated ${modLogs.length} moderation logs`)
    console.log('')
    
    // Migrate Admins
    console.log('5. Migrating Admins...')
    const admins = await devPrisma.admin.findMany()
    
    for (const admin of admins) {
      try {
        await prodPrisma.admin.delete({ where: { id: admin.id } }).catch(() => {})
        await prodPrisma.admin.create({ data: admin })
      } catch (error) {
        console.error(`  ⚠️  Failed to migrate admin ${admin.username}:`, error.message)
      }
    }
    console.log(`  ✓ Migrated ${admins.length} admins`)
    console.log('')
    
    // Final counts
    console.log('Migration complete! Final state:')
    const finalProdUserCount = await prodPrisma.user.count()
    const finalProdStoryCount = await prodPrisma.story.count()
    
    console.log(`  Prod: ${finalProdUserCount} users, ${finalProdStoryCount} stories`)
    console.log('')
    console.log('✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('')
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await devPrisma.$disconnect()
    await prodPrisma.$disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  console.log('')
  console.log('WARNING: This will OVERWRITE production data!')
  console.log('Press Ctrl+C to cancel, or Enter to continue...')
  
  process.stdin.once('data', () => {
    migrate()
  })
}