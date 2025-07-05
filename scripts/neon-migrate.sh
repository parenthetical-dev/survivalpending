#!/bin/bash

# Neon Database Migration Script
# Migrates data from dev branch to prod branch

set -e

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL_DEV and DATABASE_URL_PROD are set
if [ -z "$DATABASE_URL_DEV" ] || [ -z "$DATABASE_URL_PROD" ]; then
    echo "Error: DATABASE_URL_DEV and DATABASE_URL_PROD must be set in .env.local"
    echo "Example:"
    echo "DATABASE_URL_DEV=postgresql://user:pass@host/db?sslmode=require"
    echo "DATABASE_URL_PROD=postgresql://user:pass@host/db?sslmode=require"
    exit 1
fi

# Parse database URLs
DEV_HOST=$(echo $DATABASE_URL_DEV | sed -n 's|.*@\([^/]*\)/.*|\1|p')
DEV_DB=$(echo $DATABASE_URL_DEV | sed -n 's|.*/\([^?]*\).*|\1|p')
PROD_HOST=$(echo $DATABASE_URL_PROD | sed -n 's|.*@\([^/]*\)/.*|\1|p')
PROD_DB=$(echo $DATABASE_URL_PROD | sed -n 's|.*/\([^?]*\).*|\1|p')

echo "=== Neon Database Migration ==="
echo "Source: $DEV_HOST/$DEV_DB (dev)"
echo "Target: $PROD_HOST/$PROD_DB (prod)"
echo ""

# Confirm migration
read -p "This will OVERWRITE all data in production. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

# Create backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo ""
echo "1. Creating production backup..."
pg_dump "$DATABASE_URL_PROD" --no-owner --no-acl --clean --if-exists > "$BACKUP_DIR/prod_backup.sql"
echo "   Backup saved to: $BACKUP_DIR/prod_backup.sql"

echo ""
echo "2. Dumping dev database..."
pg_dump "$DATABASE_URL_DEV" --no-owner --no-acl --clean --if-exists > "$BACKUP_DIR/dev_dump.sql"
echo "   Dev dump saved to: $BACKUP_DIR/dev_dump.sql"

echo ""
echo "3. Restoring to production..."
psql "$DATABASE_URL_PROD" < "$BACKUP_DIR/dev_dump.sql"

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "Backup files:"
echo "- Production backup: $BACKUP_DIR/prod_backup.sql"
echo "- Dev dump: $BACKUP_DIR/dev_dump.sql"
echo ""
echo "To rollback, run:"
echo "psql \"$DATABASE_URL_PROD\" < \"$BACKUP_DIR/prod_backup.sql\""