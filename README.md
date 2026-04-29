# Fund Lineage Tracker

Blnk App split into:

- `backend` - Express + Prisma backend for install hooks, portal URL generation, and lineage proxy APIs
- repository root - Next.js frontend rendering lineage DAG with React Flow

## Quick Start

1. Copy environment files:
   - `backend/.env.example` -> `backend/.env`
   - `.env.example` -> `.env`
2. Install dependencies:
   - Frontend (root): `npm install`
   - Backend: `cd backend && npm install`
3. Start frontend:
   - `npm run dev`
4. Run backend migrations and start backend:
   - `cd backend`
   - `npm run prisma:migrate`
   - `npm run prisma:generate`
   - `npm run dev`

## Endpoints

- `POST /blnk/hooks` - install/uninstall callback handler
- `POST /blnk/portal` - portal URL generator for Blnk Cloud
- `GET /api/balances` - lineage-enabled balances
- `GET /api/lineage/balance/:balanceId` - balance lineage proxy
- `GET /api/lineage/transaction/:transactionId` - transaction lineage proxy
