# CampusOS

Monorepo for the CampusOS college ERP, matching the stack decided in
`CampusOS - College ERP Requirements and Delivery Blueprint.pdf` (Section 11).

## Layout

```
apps/api    NestJS backend (TypeScript) - REST API, Drizzle ORM, PostgreSQL
apps/web    Next.js frontend (TypeScript, Tailwind, shadcn/ui)
infra/      Infrastructure-as-code (Terraform) - added later
```

## Prerequisites

- Node.js 24 LTS
- PostgreSQL 16, installed natively (no Docker/WSL needed for local dev):
  ```powershell
  winget install -e --id PostgreSQL.PostgreSQL.16
  ```

No Docker Desktop is required. Redis, RabbitMQ, object storage and Keycloak
are not wired up yet — those are only needed for features not yet built
(caching, async notifications, file storage, SSO). When ready to add them,
point straight at managed cloud services (AWS ElastiCache/Amazon MQ/S3/
Cognito, or their Azure equivalents) rather than running anything extra
locally — see `.env.example` for the mapping.

## First-time setup

```powershell
# 1. Create the project database + superuser role (one-time, via psql)
$env:PGPASSWORD = "postgres"   # the default password winget's silent installer set
psql -U postgres -h localhost -c "create role campusos with login superuser password 'campusos_dev';"
psql -U postgres -h localhost -c "create database campusos owner campusos;"

# 2. Install dependencies (npm workspaces)
npm install

# 3. Copy env file for the API
Copy-Item apps/api/.env.example apps/api/.env

# 4. Run schema migrations + Row-Level Security policies
npm run db:setup
```

## Day to day

```bash
npm run dev:api    # http://localhost:3001 (reads PORT from apps/api/.env)
npm run dev:web    # http://localhost:3000
```

## Database & multi-tenancy

Every tenant-owned table carries a `tenant_id` and a PostgreSQL Row-Level
Security policy (`apps/api/src/db/policies/rls.sql`), enforced by connecting
as the non-owner `campusos_app` role (`APP_DATABASE_URL` in `.env`), per
Section 10.2 of the requirements document. Never point the running API at the
superuser connection (`DATABASE_URL`) — that role is for migrations only.

Schema changes:

```bash
npm run db:generate --workspace=api   # generate a new Drizzle migration from src/db/schema/*.ts
npm run db:setup                      # apply migrations + re-apply RLS policies
```

## Deployment

Production targets AWS (Section 13 of the requirements document): Aurora
PostgreSQL, ElastiCache, Amazon MQ, EKS, S3 — all managed services, not
containers you run yourself. Local development mirrors that by talking
directly to a real Postgres instance rather than emulating the whole stack
in Docker.

## Status

Scaffolded: NestJS API + Next.js web, Drizzle schema for tenant/org/student
(Section 10.6), RLS policies (Section 10.2), native local Postgres. Not yet
built: authentication, the 22 functional modules, mobile app, cloud
deployment. See the requirements document for the full module list and
roadmap.
