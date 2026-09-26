# CampusOS

Monorepo for the CampusOS college ERP, matching the stack decided in
`CampusOS - College ERP Requirements and Delivery Blueprint.pdf` (Section 11).

## Layout

```
apps/api    NestJS backend (TypeScript) - REST API, Drizzle ORM, PostgreSQL
apps/web    Next.js frontend (TypeScript, Tailwind, shadcn/ui)
infra/      Infrastructure-as-code (Terraform) - added later
docker-compose.yml   Local dev services: Postgres, Redis, RabbitMQ, Keycloak, MinIO
```

## Prerequisites

- Node.js 24 LTS
- Docker Desktop with WSL2 backend (Windows: `wsl --install --no-distro` as
  Administrator, then restart, then open Docker Desktop once)

## First-time setup

```bash
npm install                # installs both apps via npm workspaces
docker compose up -d       # starts Postgres, Redis, RabbitMQ, Keycloak, MinIO
npm run db:setup           # runs schema migrations + Row-Level Security policies
```

## Day to day

```bash
npm run dev:api    # http://localhost:3001
npm run dev:web    # http://localhost:3000
```

Local service consoles once `docker compose up -d` is running:

| Service          | URL                              | Login                          |
|-------------------|-----------------------------------|---------------------------------|
| RabbitMQ mgmt     | http://localhost:15672            | campusos / campusos_dev        |
| Keycloak          | http://localhost:8080             | admin / admin_dev               |
| MinIO console      | http://localhost:9001             | campusos / campusos_dev        |

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

## Status

Scaffolded: NestJS API + Next.js web, Drizzle schema for tenant/org/student
(Section 10.6), RLS policies (Section 10.2), local Docker infra. Not yet
built: authentication (Keycloak wiring), the 22 functional modules, mobile
app. See the requirements document for the full module list and roadmap.
