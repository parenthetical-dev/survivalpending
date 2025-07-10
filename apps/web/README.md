# Survival Pending Web Application

This is the main Next.js application for Survival Pending.

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
pnpm test:e2e
```

## Environment Variables

Create a `.env.local` file with the required environment variables. See `/workspaces/survivalpending/CLAUDE.md` for the full list.

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - React components (UI components are in `@survivalpending/ui`)
- `lib/` - Utility functions and services
- `public/` - Static assets
- `tests/` - Test files

## Dependencies

This app uses workspace packages:
- `@survivalpending/ui` - Shared UI components
- `@survivalpending/core` - Core business logic and utilities
- `@survivalpending/database` - Prisma client and database utilities