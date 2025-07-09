# Neon Test Database Setup

This project uses Neon branches for E2E testing in GitHub Actions instead of local PostgreSQL containers.

## Why Neon Branches?

- Eliminates PostgreSQL setup issues in CI/CD
- Provides isolated test environments
- Supports concurrent test runs
- Automatic cleanup capabilities

## Setup Instructions

### 1. Create a Neon Test Branch

1. Log into your Neon console
2. Navigate to your project
3. Create a new branch named `test` or `ci-testing`
4. Note the connection string

### 2. Add GitHub Secret

Add the test branch connection string as a GitHub secret:

```
Name: NEON_TEST_DATABASE_URL
Value: postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### 3. Local Testing

For local E2E testing, you can either:
- Use a local PostgreSQL instance
- Use a separate Neon branch
- Use the same test branch (not recommended for parallel development)

Set your local `.env.test` file:
```env
DATABASE_URL=your-test-database-url
TEST_SECRET=test-secret
NODE_ENV=test
```

## How It Works

1. GitHub Actions uses the `NEON_TEST_DATABASE_URL` secret
2. Before tests run, the database schema is pushed using Prisma
3. Test data is cleaned between test runs
4. The `/api/test/cleanup-users` endpoint removes test users

## Security

The cleanup endpoint is protected by:
- Environment check (only works in test/development)
- Optional `TEST_SECRET` header verification
- Prevents accidental data loss in production