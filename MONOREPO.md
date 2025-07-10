# Survival Pending Monorepo Structure

## Overview

This monorepo uses Turborepo with pnpm workspaces to manage multiple applications and shared packages.

## Directory Structure

```
.
├── apps/                    # Applications
│   ├── web/                # Next.js web application
│   └── mobile/             # React Native mobile app
├── packages/               # Shared packages
│   ├── ui/                 # Shared UI components (shadcn/ui)
│   ├── core/               # Core business logic
│   ├── database/           # Prisma schema and client
│   ├── shared/             # Shared types and constants
│   └── config/             # Shared configurations
├── tools/                  # Development tools
│   ├── backups/           # Backup files
│   ├── docs/              # Documentation
│   └── logs/              # Log files
└── Root files             # Monorepo configuration
```

## Key Files

- `turbo.json` - Turborepo pipeline configuration
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `package.json` - Root package with monorepo scripts

## Package Dependencies

```
apps/web
├── @survivalpending/ui
├── @survivalpending/core
├── @survivalpending/database
└── @survivalpending/shared

apps/mobile
├── @survivalpending/core
├── @survivalpending/database
└── @survivalpending/shared

packages/core
└── @survivalpending/database

packages/ui
└── (standalone)

packages/database
└── (standalone)

packages/shared
└── (standalone)
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Run all apps
pnpm dev --filter=web # Run web only
pnpm dev --filter=mobile # Run mobile only

# Build
pnpm build            # Build all
pnpm build --filter=web # Build web only

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations

# Testing & Quality
pnpm lint             # Lint all packages
pnpm test             # Run tests
pnpm type-check       # Type check
pnpm format           # Format code

# Clean
pnpm clean            # Clean all build artifacts
```

## Adding New Packages

1. Create directory: `mkdir -p packages/new-package/src`
2. Add package.json with workspace protocol
3. Add to turbo.json pipelines if needed
4. Run `pnpm install` to link

## Environment Variables

- Web app: `apps/web/.env.local`
- Mobile app: `apps/mobile/.env.local`

## Deployment

- Web: Deploy `apps/web` to Vercel
- Mobile: Build with Expo EAS from `apps/mobile`