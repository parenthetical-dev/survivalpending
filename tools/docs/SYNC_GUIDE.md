# Neon ↔ Sanity Sync Guide

This guide explains how to sync data between Neon (PostgreSQL) and Sanity CMS for the Survival Pending project.

## Overview

The sync system provides:
- **Bidirectional sync** between Neon and Sanity
- **Database migration** from dev to prod branches in Neon
- **Webhook integration** for real-time updates from Sanity
- **Cron jobs** for automatic periodic sync
- **CLI tools** for manual sync operations

## Setup

### 1. Environment Variables

Add these to your `.env.local`:

```bash
# Neon Database URLs
DATABASE_URL=postgresql://... # Current environment
DATABASE_URL_DEV=postgresql://... # Dev branch
DATABASE_URL_PROD=postgresql://... # Prod branch

# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_DATASET_DEV=development
SANITY_ADMIN_TOKEN=your-admin-token # For webhook setup

# Sync Configuration
SANITY_WEBHOOK_SECRET=your-webhook-secret
CRON_SECRET=your-cron-secret
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Webhooks

Run the setup script to get webhook configuration:

```bash
npm run webhooks:setup
```

Then manually add the webhooks in Sanity Studio:
1. Go to `https://www.sanity.io/manage/project/[PROJECT_ID]/api/webhooks`
2. Create webhooks for both dev and prod environments
3. Use the configuration provided by the setup script

## Usage

### Database Migration (Neon Dev → Prod)

#### Option 1: Full Database Migration
```bash
# Copies all data from dev to prod
./scripts/neon-migrate.sh
```

#### Option 2: Selective Table Migration
```bash
# Migrates specific tables with better control
npm run migrate:neon
```

### Data Sync (Neon ↔ Sanity)

#### Check Sync Status
```bash
npm run sync:status
```

#### Manual Sync Commands
```bash
# Sync development environment
npm run sync:dev

# Sync production environment  
npm run sync:prod

# Advanced sync with options
npm run sync -- sync --env production --direction neon-to-sanity --include-rejected
```

#### Sync Directions
- `neon-to-sanity`: Push all stories from Neon to Sanity
- `sanity-to-neon`: Pull moderation updates from Sanity to Neon
- `bidirectional`: Both directions (default)

### Automatic Sync

The system includes automatic sync via:

1. **Webhooks**: Real-time updates when stories are moderated in Sanity
2. **Cron Jobs**: Runs every 15 minutes (configured in `vercel.json`)

## API Endpoints

### Webhook Endpoint
- **POST** `/api/webhooks/sanity`
- Receives updates from Sanity
- Updates story status in Neon

### Admin Sync API
- **POST** `/api/admin/sync`
  ```json
  {
    "environment": "development|production",
    "direction": "neon-to-sanity|sanity-to-neon|bidirectional",
    "includeRejected": false
  }
  ```
- **GET** `/api/admin/sync` - Get sync status

### Cron Endpoint
- **GET** `/api/cron/sync`
- Triggered by Vercel Cron
- Requires `CRON_SECRET` auth

## Sync Flow

### New Story Submission
1. User submits story → Saved to Neon
2. `syncStoryToSanity()` pushes to Sanity
3. Story appears in Sanity Studio for moderation

### Story Moderation
1. Moderator approves/rejects in Sanity
2. Webhook triggers `/api/webhooks/sanity`
3. Status updated in Neon database
4. Moderation logged in `ModerationLog` table

### Periodic Sync
1. Cron job runs every 15 minutes
2. Bidirectional sync ensures consistency
3. Any missed webhook updates are caught

## Troubleshooting

### Sync Issues
```bash
# Check sync status
npm run sync:status

# Force full sync
npm run sync -- sync --env production --direction bidirectional

# Check logs
vercel logs --filter=sync
```

### Migration Issues
```bash
# Backup before migration
pg_dump "$DATABASE_URL_PROD" > backup.sql

# Restore if needed
psql "$DATABASE_URL_PROD" < backup.sql
```

### Common Problems

1. **Webhook not firing**
   - Check webhook secret matches
   - Verify webhook URL is correct
   - Check Sanity webhook logs

2. **Sync count mismatch**
   - Run bidirectional sync
   - Check for deleted records
   - Verify dataset configuration

3. **Permission errors**
   - Ensure `SANITY_ADMIN_TOKEN` has write access
   - Check database user permissions
   - Verify JWT token for admin endpoints

## Best Practices

1. **Always backup before migration**
   ```bash
   pg_dump "$DATABASE_URL_PROD" > backup_$(date +%Y%m%d).sql
   ```

2. **Test in development first**
   ```bash
   npm run sync:dev
   ```

3. **Monitor sync status**
   - Check `/api/admin/sync` endpoint
   - Monitor Vercel Functions logs
   - Set up alerts for sync failures

4. **Handle conflicts**
   - Neon is source of truth for new stories
   - Sanity is source of truth for moderation status
   - Timestamps help resolve conflicts