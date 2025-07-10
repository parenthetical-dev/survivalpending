#!/usr/bin/env node

/**
 * Selective Neon Database Migration
 * Allows migration of specific tables with data transformation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const DEV_URL = process.env.DATABASE_URL_DEV || process.env.DATABASE_URL;
const PROD_URL = process.env.DATABASE_URL_PROD;

if (!DEV_URL || !PROD_URL) {
  console.error('Error: DATABASE_URL_DEV and DATABASE_URL_PROD must be set');
  console.error('Example:');
  console.error('  DATABASE_URL_DEV=postgresql://user:pass@host/db');
  console.error('  DATABASE_URL_PROD=postgresql://user:pass@host/db');
  process.exit(1);
}

// Tables to migrate (in order due to foreign key constraints)
const TABLES_TO_MIGRATE = [
  'User',
  'UserDemographics',
  'Story',
  'CrisisInterventionLog',
  'ModerationLog',
  'Admin'
];

// Tables to exclude from migration
const EXCLUDE_TABLES = [
  '_prisma_migrations' // Prisma migration history
];

async function migrate() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join('backups', timestamp);
  
  // Create backup directory
  fs.mkdirSync(backupDir, { recursive: true });
  
  console.log('=== Neon Selective Database Migration ===');
  console.log(`Backup directory: ${backupDir}`);
  console.log('');
  
  try {
    // 1. Backup production database
    console.log('1. Creating production backup...');
    const prodBackupFile = path.join(backupDir, 'prod_backup.sql');
    execSync(`pg_dump "${PROD_URL}" --no-owner --no-acl > "${prodBackupFile}"`, { stdio: 'inherit' });
    console.log(`   ✓ Backup saved to: ${prodBackupFile}`);
    console.log('');
    
    // 2. Export specific tables from dev
    console.log('2. Exporting tables from dev...');
    for (const table of TABLES_TO_MIGRATE) {
      const tableFile = path.join(backupDir, `${table}.sql`);
      console.log(`   - Exporting ${table}...`);
      
      // Export table structure and data
      execSync(`pg_dump "${DEV_URL}" --no-owner --no-acl --table='"${table}"' > "${tableFile}"`, { stdio: 'inherit' });
    }
    console.log('   ✓ All tables exported');
    console.log('');
    
    // 3. Clear production tables (in reverse order to handle foreign keys)
    console.log('3. Clearing production tables...');
    const reversedTables = [...TABLES_TO_MIGRATE].reverse();
    
    for (const table of reversedTables) {
      console.log(`   - Truncating ${table}...`);
      execSync(`psql "${PROD_URL}" -c "TRUNCATE TABLE \\"${table}\\" CASCADE;"`, { stdio: 'inherit' });
    }
    console.log('   ✓ Production tables cleared');
    console.log('');
    
    // 4. Import tables to production
    console.log('4. Importing tables to production...');
    for (const table of TABLES_TO_MIGRATE) {
      const tableFile = path.join(backupDir, `${table}.sql`);
      console.log(`   - Importing ${table}...`);
      execSync(`psql "${PROD_URL}" < "${tableFile}"`, { stdio: 'inherit' });
    }
    console.log('   ✓ All tables imported');
    console.log('');
    
    // 5. Verify migration
    console.log('5. Verifying migration...');
    for (const table of TABLES_TO_MIGRATE) {
      const result = execSync(
        `psql "${PROD_URL}" -t -c "SELECT COUNT(*) FROM \\"${table}\\";"`,
        { encoding: 'utf8' }
      ).trim();
      console.log(`   - ${table}: ${result} records`);
    }
    
    console.log('');
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('To rollback, run:');
    console.log(`psql "${PROD_URL}" < "${prodBackupFile}"`);
    
  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('You can restore from backup:');
    console.error(`psql "${PROD_URL}" < "${path.join(backupDir, 'prod_backup.sql')}"`);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  console.log('');
  console.log('WARNING: This will OVERWRITE production data!');
  console.log('Press Ctrl+C to cancel, or Enter to continue...');
  
  process.stdin.once('data', () => {
    migrate();
  });
}