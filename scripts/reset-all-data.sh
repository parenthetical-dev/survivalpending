#!/bin/bash

# Script to reset all data in both PostgreSQL and Sanity
# Usage: ./scripts/reset-all-data.sh [--prod]

echo "🔄 Survival Pending - Database Reset Script"
echo "=========================================="

# Check if production flag is set
if [[ "$1" == "--prod" ]]; then
    DATASET="production"
    echo "⚠️  PRODUCTION MODE - This will clear PRODUCTION data!"
else
    DATASET="development"
    echo "📦 Development mode - Clearing development data"
fi

echo ""
echo "This script will:"
echo "1. Clear all data from PostgreSQL (keeping schema)"
echo "2. Clear all stories from Sanity $DATASET dataset"
echo "3. Optionally create example stories"
echo ""

read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

# Step 1: Clear PostgreSQL
echo ""
echo "Step 1: Clearing PostgreSQL database..."
echo "--------------------------------------"
if [[ "$1" == "--prod" ]]; then
    node scripts/clear-database.js --prod
else
    node scripts/clear-database.js
fi

# Step 2: Clear Sanity
echo ""
echo "Step 2: Clearing Sanity $DATASET dataset..."
echo "--------------------------------------"
node scripts/clear-sanity.js --dataset=$DATASET

# Step 3: Ask about example data
echo ""
read -p "Would you like to create 8 example stories? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Step 3: Creating example stories..."
    echo "-----------------------------------"
    node scripts/create-example-stories.js
    
    echo ""
    echo "⚠️  Note: Example stories are created in PostgreSQL but need to be synced to Sanity."
    echo "They will sync automatically when you restart the development server."
fi

echo ""
echo "✅ Database reset complete!"
echo ""
echo "Next steps:"
echo "1. Restart your development server to ensure fresh connections"
echo "2. If you created example stories, they'll sync to Sanity on first API call"
echo "3. You can now create new stories with the [EXAMPLE] prefix"