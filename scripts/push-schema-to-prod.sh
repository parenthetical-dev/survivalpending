#!/bin/bash

# Production database URL
PROD_DATABASE_URL="postgresql://neondb_owner:npg_3L2kGBAhpJvm@ep-divine-sky-a8umwvae-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "Pushing schema to production database..."
echo "Target: ep-divine-sky-a8umwvae-pooler.eastus2.azure.neon.tech/neondb"

# Export the production database URL for Prisma to use
export DATABASE_URL="$PROD_DATABASE_URL"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push the schema to production (this will create tables without running migrations)
echo "Pushing schema to production database..."
npx prisma db push --skip-generate

echo "Schema push complete!"
echo ""
echo "Note: This pushed the schema structure only. No seed data was transferred."
echo "The production database now has all the required tables and relationships."