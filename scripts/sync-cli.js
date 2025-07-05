#!/usr/bin/env node

/**
 * Survival Pending Sync CLI
 * Manage database synchronization between Neon and Sanity
 */

const { Command } = require('commander')
// Since sync-service is TypeScript, we'll use a simpler approach
const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@sanity/client')
const { execSync } = require('child_process')
const readline = require('readline')

const program = new Command()

program
  .name('sync-cli')
  .description('Manage Neon ↔ Sanity synchronization')
  .version('1.0.0')

// Status command
program
  .command('status')
  .description('Check sync status for both environments')
  .action(async () => {
    try {
      console.log('Checking sync status...\n')
      
      const [devStatus, prodStatus] = await Promise.all([
        devSyncService.getSyncStatus(),
        prodSyncService.getSyncStatus()
      ])
      
      console.log('DEVELOPMENT:')
      console.log(`  Dataset: ${devStatus.dataset}`)
      console.log(`  Neon stories: ${devStatus.neonStories}`)
      console.log(`  Sanity stories: ${devStatus.sanityStories}`)
      console.log(`  Pending moderation: ${devStatus.pendingModeration}`)
      console.log(`  Approved: ${devStatus.approved}`)
      console.log(`  Synced: ${devStatus.synced ? '✓' : '✗'}\n`)
      
      console.log('PRODUCTION:')
      console.log(`  Dataset: ${prodStatus.dataset}`)
      console.log(`  Neon stories: ${prodStatus.neonStories}`)
      console.log(`  Sanity stories: ${prodStatus.sanityStories}`)
      console.log(`  Pending moderation: ${prodStatus.pendingModeration}`)
      console.log(`  Approved: ${prodStatus.approved}`)
      console.log(`  Synced: ${prodStatus.synced ? '✓' : '✗'}`)
      
    } catch (error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  })

// Sync command
program
  .command('sync')
  .description('Perform database synchronization')
  .option('-e, --env <environment>', 'Environment (development/production)', 'development')
  .option('-d, --direction <direction>', 'Sync direction (neon-to-sanity/sanity-to-neon/bidirectional)', 'bidirectional')
  .option('--include-rejected', 'Include rejected stories in sync')
  .action(async (options) => {
    const { env, direction, includeRejected } = options
    const syncService = env === 'production' ? prodSyncService : devSyncService
    
    console.log(`\nStarting ${direction} sync for ${env}...`)
    if (includeRejected) console.log('Including rejected stories')
    console.log('')
    
    try {
      let result
      
      switch (direction) {
        case 'neon-to-sanity':
          result = await syncService.syncNeonToSanity({ includeRejected })
          break
          
        case 'sanity-to-neon':
          result = await syncService.syncSanityToNeon()
          break
          
        case 'bidirectional':
          result = await syncService.syncBidirectional({ includeRejected })
          break
          
        default:
          throw new Error(`Invalid direction: ${direction}`)
      }
      
      console.log('\n✅ Sync completed successfully!')
      console.log(JSON.stringify(result, null, 2))
      
    } catch (error) {
      console.error('\n❌ Sync failed:', error.message)
      process.exit(1)
    }
  })

// Migrate command
program
  .command('migrate')
  .description('Migrate data from dev to prod in Neon')
  .option('--dry-run', 'Show what would be migrated without executing')
  .action(async (options) => {
    console.log('\n⚠️  WARNING: This will OVERWRITE production data!')
    
    if (!options.dryRun) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const answer = await new Promise(resolve => {
        rl.question('Type "yes" to continue: ', resolve)
      })
      rl.close()
      
      if (answer !== 'yes') {
        console.log('Migration cancelled.')
        return
      }
    }
    
    try {
      if (options.dryRun) {
        console.log('\nDRY RUN - No changes will be made')
        console.log('Would migrate the following tables:')
        console.log('  - User')
        console.log('  - UserDemographics')
        console.log('  - Story')
        console.log('  - CrisisInterventionLog')
        console.log('  - ModerationLog')
        console.log('  - Admin')
      } else {
        console.log('\nRunning migration...')
        execSync('node scripts/neon-selective-migrate.js', { 
          stdio: 'inherit',
          input: '\n' // Auto-confirm
        })
      }
    } catch (error) {
      console.error('Migration failed:', error.message)
      process.exit(1)
    }
  })

// Setup command
program
  .command('setup')
  .description('Setup webhooks and cron jobs')
  .action(() => {
    console.log('\nSetting up webhooks and cron jobs...\n')
    
    try {
      execSync('node scripts/setup-sanity-webhooks.js', { stdio: 'inherit' })
      
      console.log('\nNext steps:')
      console.log('1. Add the webhook configurations to Sanity Studio')
      console.log('2. Add environment variables to Vercel')
      console.log('3. Deploy to trigger cron job registration')
      
    } catch (error) {
      console.error('Setup failed:', error.message)
      process.exit(1)
    }
  })

program.parse()