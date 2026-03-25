# Catalog App

Product catalog application with:

- `frontend`: Vite + React
- `backend`: Hono API
- `bun`: package manager and runtime
- `MinIO`: planned object storage backend
- `docker compose`: local Postgres and MinIO

## Getting Started

Install dependencies:

```bash
bun install
```

Start infrastructure:

```bash
docker compose up -d
```

Run both apps:

```bash
bun run dev
```

Or run each app separately:

```bash
bun run dev:frontend
bun run dev:backend
```

## App Structure

- `frontend`: public catalog and authenticated dashboard UI
- `backend`: auth, products, catalog, analytics, and MinIO integration

## Next Steps

- database schema
- JWT auth with refresh tokens
- MinIO upload flow
- product CRUD persistence
- shadcn UI setup

## Local Services

- Postgres: `localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

Default local credentials are defined in:

- [docker-compose.yml](/mnt/data/workspace/Web/JavaScript/catalog-app/docker-compose.yml)
- [backend/.env.example](/mnt/data/workspace/Web/JavaScript/catalog-app/backend/.env.example)
