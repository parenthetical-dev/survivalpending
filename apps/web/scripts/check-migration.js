#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

const DEV_URL = process.env.DATABASE_URL_DEV || process.env.DATABASE_URL
const PROD_URL = process.env.DATABASE_URL_PROD

if (!DEV_URL || !PROD_URL) {
  console.error('Error: DATABASE_URL and DATABASE_URL_PROD must be set')
  process.exit(1)
}

async function checkStatus() {
  const devPrisma = new PrismaClient({
    datasources: { db: { url: DEV_URL } }
  })
  
  const prodPrisma = new PrismaClient({
    datasources: { db: { url: PROD_URL } }
  })
  
  try {
    console.log('=== Migration Status Check ===\n')
    
    // Get counts
    const [devUsers, devStories, prodUsers, prodStories] = await Promise.all([
      devPrisma.user.count(),
      devPrisma.story.count(),
      prodPrisma.user.count(),
      prodPrisma.story.count()
    ])
    
    console.log('Development:')
    console.log(`  Users: ${devUsers}`)
    console.log(`  Stories: ${devStories}`)
    console.log('')
    
    console.log('Production:')
    console.log(`  Users: ${prodUsers}`)
    console.log(`  Stories: ${prodStories}`)
    console.log('')
    
    // Check some recent stories
    const recentStories = await prodPrisma.story.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })
    
    console.log('Recent stories in production:')
    recentStories.forEach(story => {
      console.log(`  - ${story.user?.username || 'anonymous'}: ${story.contentText.substring(0, 50)}...`)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await devPrisma.$disconnect()
    await prodPrisma.$disconnect()
  }
}

checkStatus()