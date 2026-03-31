# Real Data Routes Design

**Date:** 2026-03-31
**Status:** Approved

## Overview

Replace all hardcoded/mock data in backend route handlers with real database queries. Add a `products` table to Drizzle schema, migrate it, and wire every route to read/write from Postgres. Images are stored in MinIO; product rows hold `{ id, url, isCover }[]` metadata as JSONB.

## Goals

- No route returns hardcoded data
- All CRUD for products persists to Postgres
- Settings reads/writes from the existing `users` table
- Dashboard and analytics derive counts from real product data (view counts = 0 for MVP)
- Catalog serves published products for a given company slug
- MinIO presign/confirm flow is fully implemented
- Password change and account deletion are wired up in auth routes

## Out of scope

- View/click tracking (analytics view counts remain 0 until a tracking subsystem is built)
- Product image reordering beyond what the frontend already handles
- Pagination (return all records for now)
- Cleanup of orphaned images under `products/new/` (MVP — not implemented)

---

## Database

### New table: `products`

```ts
products
─────────────────────────────────────────────────────
id           uuid, pk, defaultRandom()
userId       uuid, FK → users.id, not null, onDelete cascade
name         text, not null
description  text, not null
price        numeric(10,2), not null
sku          text, nullable
category     text, nullable
status       text, not null, default 'draft'   -- 'draft' | 'published'
featured     boolean, not null, default false
slug         text, nullable
externalUrl  text, nullable
images       jsonb, not null, default '[]'     -- { id, url, isCover }[]
createdAt    timestamp, not null, defaultNow()
```

Index: `(userId)` for efficient per-user queries.

All product queries are scoped to the authenticated user's `userId` — a user can never read or modify another user's products.

The `images` array is fully managed by the frontend — the backend stores whatever array it receives on POST/PUT. `isCover` toggling is handled client-side before saving.

---

## Backend changes

### Schema (`backend/src/db/schema.ts`)

Add `products` table alongside existing `users` table.

### Migration

Run `bunx drizzle-kit generate` then apply via `docker exec catalog-postgres psql` (host port 5433, not 5432 — another container owns 5432).

### Products routes (`backend/src/routes/products.ts`)

Auth middleware is already applied to `products.use("*", authMiddleware)`.

| Method | Path | Behaviour |
|---|---|---|
| `GET` | `/` | SELECT all products WHERE userId = auth user, ordered by createdAt DESC |
| `POST` | `/` | INSERT product with userId from auth context, return created row (201) |
| `GET` | `/:id` | SELECT WHERE id = ? AND userId = ? → 404 if not found |
| `PUT` | `/:id` | Full update WHERE id = ? AND userId = ? → 404 if not found |
| `DELETE` | `/:id` | DELETE WHERE id = ? AND userId = ? → 200 `{ ok: true }` |
| `POST` | `/:id/images/presign` | Generate presigned PUT URL for MinIO key `products/{productId}/{imageId}`, return `{ uploadUrl, imageId }` |
| `POST` | `/:id/images/confirm` | Return `{ id: imageId, url, isCover: false }` where url = `${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/products/${productId}/${imageId}` |

`PUT` replaces the full product (including `images` array). Note: frontend uses `PUT` (not `PATCH`) for updates — see `product-editor-page.tsx`.

**MinIO URL note:** `env.MINIO_ENDPOINT` is a full URL (e.g. `http://localhost:9000`). The confirmed image URL is constructed as:
```ts
`${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/products/${productId}/${imageId}`
// → http://localhost:9000/catalog-assets/products/new/abc123
```

### Dashboard route (`backend/src/routes/dashboard.ts`)

Auth middleware already applied. `GET /stats`:
```json
{
  "totalProducts": <count>,
  "publishedProducts": <count>,
  "draftProducts": <count>,
  "catalogViews": 0,
  "productViews": 0,
  "topProduct": null
}
```
Counts derived from `SELECT COUNT(*) FROM products WHERE userId = ?` grouped by status.

### Analytics routes (`backend/src/routes/analytics.ts`)

Auth middleware already applied (do not remove it during rewrite).

`GET /overview`:
```json
{
  "catalogViews": 0,
  "productViews": 0,
  "publishedProducts": <real count from DB>,
  "ctaClicks": 0
}
```

`GET /products`:
```json
{
  "items": [
    { "productId": "...", "title": "...", "views": 0 },
    ...
  ]
}
```
Items are real published products for the auth user, each with `views: 0`.

### Settings routes (`backend/src/routes/settings.ts`)

Auth middleware already applied. Three endpoints, all touching the `users` table:

| Method | Path | Behaviour |
|---|---|---|
| `GET` | `/` | Return `{ companyName, companySlug, name, email }` from users WHERE id = auth user |
| `PUT` | `/company` | UPDATE users SET companyName, companySlug WHERE id = auth user |
| `PUT` | `/account` | UPDATE users SET name WHERE id = auth user — email is intentionally not updatable |

`companySlug` uniqueness must be re-checked on update — exclude current user from the check (409 if another user owns the slug).

### Auth routes — new endpoints (`backend/src/routes/auth.ts`)

Two new endpoints called from the settings page:

| Method | Path | Auth | Behaviour |
|---|---|---|---|
| `PUT` | `/password` | Yes | Verify `currentPassword` against bcrypt hash, update to new bcrypt hash. Body: `{ currentPassword, newPassword }`. Returns 401 if currentPassword is wrong. |
| `DELETE` | `/account` | Yes | DELETE user from users table (cascades to products via FK). Returns `{ ok: true }`. |

### Catalog route (`backend/src/routes/catalog.ts`)

No auth required (public endpoint — auth middleware is NOT applied here).

`GET /:companySlug`:
```json
{
  "company": { "name": "...", "description": null },
  "products": [ ...published products for that company... ]
}
```
- SELECT user WHERE `companySlug = ?` → 404 `{ error: "Catalog not found" }` if none
- SELECT products WHERE `userId = user.id AND status = 'published'`
- `description` field is `null` (not on users table — reserved for future)

---

## MinIO image flow

```
1. POST /products/:id/images/presign  { fileName, contentType }
   → imageId = crypto.randomUUID()
   → key = `products/${productId}/${imageId}`
   → presignedUrl = getSignedUrl(PutObjectCommand, { Bucket: env.MINIO_BUCKET, Key: key, ContentType }, { expiresIn: 300 })
   → return { uploadUrl: presignedUrl, imageId }

2. Browser uploads file directly to uploadUrl via XHR
   (no Authorization header — the presigned URL embeds MinIO credentials)

3. POST /products/:id/images/confirm  { imageId }
   → url = `${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/products/${productId}/${imageId}`
   → return { id: imageId, url, isCover: false }

4. Frontend holds images[] in state, sends full array with product POST/PUT
```

`productId = "new"` is valid — images stored under `products/new/{imageId}` until the product is created. Orphaned objects are not cleaned up in this iteration.

---

## Data flow summary

```
Auth user creates product
  → POST /products (body: { name, description, price, status, images[], ... })
  → INSERT into products with userId = auth user
  → 201 { id, name, ... }

Auth user updates product
  → PUT /products/:id (full body including images[])
  → UPDATE products WHERE id = ? AND userId = ?
  → 200 { id, name, ... }

Auth user lists products
  → GET /products
  → SELECT * FROM products WHERE userId = ? ORDER BY createdAt DESC

Public catalog visitor
  → GET /catalog/acme-co
  → SELECT user WHERE companySlug = 'acme-co'
  → SELECT products WHERE userId = user.id AND status = 'published'
  → { company: { name }, products: [...] }

Dashboard load
  → GET /dashboard/stats (auth required)
  → COUNT products grouped by status WHERE userId = ?
```

---

## Error handling

| Scenario | Response |
|---|---|
| Product not found or wrong owner | `404 { error: "Not found" }` |
| Missing required fields on product create | `400 { error: "Missing required fields" }` |
| Company slug taken on settings update | `409 { error: "Slug already taken" }` |
| Company slug not found on catalog | `404 { error: "Catalog not found" }` |
| Wrong current password on password change | `401 { error: "Invalid current password" }` |
