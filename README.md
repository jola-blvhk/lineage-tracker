# Fund Lineage Tracker

Blnk App monorepo with:

- `apps/backend` - Express + Prisma backend for install hooks, portal URL generation, and lineage proxy APIs
- `apps/frontend` - React iframe app rendering lineage DAG with React Flow

## Quick Start

1. Copy environment files:
   - `apps/backend/.env.example` -> `apps/backend/.env`
   - `apps/frontend/.env.example` -> `apps/frontend/.env`
2. Install dependencies:
   - `npm install`
3. Run database migration and Prisma client generation:
   - `npm run prisma:migrate --workspace backend`
   - `npm run prisma:generate --workspace backend`
4. Start both services:
   - `npm run dev`

## Endpoints

- `POST /blnk/hooks` - install/uninstall callback handler
- `POST /blnk/portal` - portal URL generator for Blnk Cloud
- `GET /api/balances` - lineage-enabled balances
- `GET /api/lineage/balance/:balanceId` - balance lineage proxy
- `GET /api/lineage/transaction/:transactionId` - transaction lineage proxy
# lineage-tracker
