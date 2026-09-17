# i-wallet

A digital wallet API built with NestJS, Prisma, and PostgreSQL. Users can register, log in, and deposit, withdraw, or transfer money between wallets — with idempotent writes, an audit trail, and concurrency-safe balance updates.

This project is a capstone exercise from the *NestJS Backend Architecture* module of a self-directed backend learning roadmap.

## Tech stack

- **Framework:** NestJS 12
- **Language:** TypeScript
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech), serverless)
- **ORM:** Prisma 7 (driver adapter: `@prisma/adapter-pg`)
- **Auth:** JWT (`@nestjs/jwt` + `@nestjs/passport`)
- **Validation:** `class-validator` / `class-transformer`
- **Docs:** Swagger / OpenAPI (`@nestjs/swagger`, auto-generated from TypeScript types and JSDoc comments)
- **Rate limiting:** `@nestjs/throttler`
- **Testing:** Vitest (unit + e2e), Supertest
- **Password hashing:** bcrypt

## Features

- **Auth:** register (creates a `User` + a zero-balance `Wallet` in one atomic transaction) and login (returns a JWT)
- **Wallet operations:** deposit, withdraw, transfer between wallets — each wrapped in a single database transaction covering the balance update, the transaction record, and the audit log entry
- **Idempotency:** every write to `/wallets/*` requires a client-generated UUID v7 `idempotencyKey`. Repeating the same key returns the original result instead of performing the operation twice
- **Balance integrity:** a `CHECK (balance >= 0)` constraint at the database level, plus an explicit balance check in the withdraw service, defend against overdrafts — verified under 50 concurrent withdrawal requests in `test/wallets-concurrency.e2e-spec.ts`
- **Audit log:** every balance-changing action writes an `AuditLog` row (many-to-one with `User`) inside the same transaction as the balance change
- **RBAC:** `USER` / `ADMIN` roles enforced via a `RolesGuard` reading `@Roles()` metadata
- **Rate limiting:** per-user throttling (falls back to per-IP for unauthenticated requests) on wallet-mutating endpoints
- **Admin endpoints:** inspect any wallet and filter/paginate all transactions by status or type
- **Health check:** `/health` verifies the database connection via `@nestjs/terminus`
- **API docs:** interactive Swagger UI at `/docs`, generated automatically from DTO/entity types and JSDoc `@example` tags — no manual `@ApiProperty()` needed

## Prerequisites

- Node.js (see `package.json` engines / `.nvmrc` if present)
- A PostgreSQL database (this project targets a Neon serverless instance, but any Postgres 16+ works)

## Environment variables

Create a `.env` file in the project root:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Pooled connection string, used by the running app | `postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require` |
| `DIRECT_URL` | Direct (non-pooled) connection string, used by `prisma migrate` | `postgresql://user:pass@host.neon.tech/db?sslmode=require` |
| `JWT_SECRET` | Secret used to sign/verify JWTs — generate with `openssl rand -hex 64` | `a3f5c9e2...` |
| `JWT_EXPIRES_IN` | JWT lifetime | `1d` |
| `PORT` | HTTP port (optional, defaults to `3000`) | `3000` |

## Setup

```bash
npm install
npx prisma migrate dev
```

## Running the app

```bash
# development (watch mode)
npm run start:dev

# production
npm run build
npm run start:prod
```

Once running:
- API base URL: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/docs`

## API overview

All request/response shapes, validation rules, and examples are documented in Swagger (`/docs`). Summary:

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/users` | — | Register a new user + wallet |
| POST | `/users/login` | — | Log in, returns a JWT |
| GET | `/users/:id` | JWT | Get a user by id |
| GET | `/wallets/me` | JWT | Get the logged-in user's wallet |
| GET | `/wallets/me/transaction` | JWT | Paginated transaction history for the logged-in user |
| POST | `/wallets/deposit` | JWT | Deposit into the logged-in user's wallet |
| POST | `/wallets/withdraw` | JWT | Withdraw from the logged-in user's wallet |
| POST | `/wallets/transfer` | JWT | Transfer to another wallet by wallet id |
| GET | `/admin/wallets/:id` | JWT + Admin | Look up any wallet |
| GET | `/admin/transactions` | JWT + Admin | Paginated, filterable transaction list |
| GET | `/health` | — | Database connectivity check |

Deposit, withdraw, and transfer all require an `idempotencyKey` (UUID v7) in the request body.

## Testing

```bash
# e2e tests (spins up the full Nest app in-process against the real database)
npm run test:e2e

# unit tests
npm run test

# coverage
npm run test:cov
```

`test/wallets-concurrency.e2e-spec.ts` fires 50 concurrent withdrawal requests at a single wallet and asserts the final balance matches exactly what the successful requests should have spent, with no negative balance.

## Project structure

```
src/
  admin/       # admin-only wallet/transaction inspection
  audit/       # AuditService — writes audit log entries within a caller-provided transaction
  auth/        # JWT strategy, guards (JwtAuthGuard, RolesGuard, UserThrottlerGuard)
  common/      # shared decorators, exception filter, pagination helper
  health/      # /health endpoint (Terminus)
  prisma/      # PrismaService (driver-adapter based PrismaClient)
  users/       # register/login
  wallets/     # deposit/withdraw/transfer, wallet + transaction reads
prisma/
  schema.prisma
  migrations/
test/
  *.e2e-spec.ts
```

## Known limitations

- Transfers only accept a destination `walletId` — transferring by recipient email is not implemented in this version.
- Service-level unit tests (mocking Prisma) are not yet written; correctness is currently covered by e2e tests only.
