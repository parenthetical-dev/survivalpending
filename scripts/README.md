# Scripts Directory

This directory contains utility scripts for managing the Survival Pending application.

## ⚠️ WARNING: DESTRUCTIVE SCRIPTS

Some scripts in this directory can permanently delete data. Always review what a script does before running it.

## Script Categories

### 🔴 DANGEROUS - Data Deletion Scripts
These scripts permanently delete data and should be used with extreme caution:

- `clear-database.js` - Deletes all data from PostgreSQL (use `--prod` flag for production)
- `clear-sanity.js` - Deletes all stories from Sanity CMS
- `reset-all-data.sh` - Nuclear option: clears both database and CMS

### 🟡 CAUTION - Data Modification Scripts
These scripts modify existing data:

- `add-example-stories.js` - Adds sample stories to database
- `approve-example-stories.js` - Approves pending stories
- `generate-story-audio.js` - Generates audio for stories
- `update-databases.js` - Updates database records
- `backfill-story-colors.ts` - Adds colors to existing stories

### 🟢 SAFE - Setup and Migration Scripts
These scripts are generally safe to run:

- `setup-sanity.js` - Initial Sanity setup
- `setup-sanity-webhooks.js` - Configures webhooks
- `sync-cli.js` - Sync utility
- `check-migration.js` - Checks migration status
- `verify-colors.js` - Verifies data integrity

### 🔵 UTILITY - Testing Scripts
For development and testing:

- `test-elevenlabs.js` - Tests ElevenLabs API integration

## Safety Guidelines

1. **Always check which environment you're targeting**
   - Scripts default to development unless `--prod` flag is used
   - Production scripts require `PROD_DATABASE_URL` environment variable

2. **Review the script's warning messages**
   - Destructive scripts show what will be deleted
   - Most have a 5-second delay before execution

3. **Make backups before running destructive scripts**
   - Especially for production data
   - Some scripts create automatic backups

4. **Required Environment Variables**
   Most scripts require specific environment variables:
   - `DATABASE_URL` - Development database
   - `PROD_DATABASE_URL` - Production database
   - `ELEVENLABS_API_KEY` - For audio generation
   - `NEXT_PUBLIC_SANITY_*` - For Sanity operations

## Restricted Scripts

The following scripts have been removed or gitignored for safety:
- `neon-migrate.sh` - Could overwrite production with dev data
- `clear-prod-database.js` - Production deletion (gitignored)

## Development Workflow

For typical development tasks:

1. **Reset local environment**: `./scripts/reset-all-data.sh`
2. **Add test data**: `npm run db:add-stories`
3. **Generate audio**: `npm run db:generate-audio`

## Production Operations

Production operations should be performed with extreme caution and preferably by authorized personnel only. Consider implementing additional access controls for production scripts.