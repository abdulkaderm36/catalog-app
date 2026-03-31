# Real Data Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded mock data in backend routes with real Postgres queries, implement products CRUD, MinIO image upload, and wire settings/dashboard/analytics/catalog to the database.

**Architecture:** Add a `products` table to Drizzle schema (FK to `users`), run migration, then replace each stub route file with a real implementation. Settings and auth password/delete routes read/write the existing `users` table. Dashboard and analytics derive counts from products. Catalog joins users + products by companySlug.

**Tech Stack:** Hono, Drizzle ORM, Postgres.js, bcrypt, jose, AWS S3 SDK + s3-request-presigner (MinIO)

---

## File Map

| File | Change |
|---|---|
| `backend/src/db/schema.ts` | Add `products` table |
| `backend/drizzle/` | New migration SQL (auto-generated) |
| `backend/src/routes/products.ts` | Full rewrite — real CRUD + MinIO presign/confirm |
| `backend/src/routes/dashboard.ts` | Replace stub with real COUNT queries |
| `backend/src/routes/analytics.ts` | Replace stub with real product data |
| `backend/src/routes/settings.ts` | Replace stub with real users table reads/writes |
| `backend/src/routes/catalog.ts` | Replace stub with real join query |
| `backend/src/routes/auth.ts` | Add PUT /password and DELETE /account |

---

## Task 1: Extend Drizzle schema with products table

**Files:**
- Modify: `backend/src/db/schema.ts`

- [ ] **Step 1: Update schema.ts**

Replace the entire file with:

```ts
import { pgTable, text, timestamp, uuid, numeric, boolean, jsonb, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  companySlug: text("company_slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductImage = { id: string; url: string; isCover: boolean };

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  sku: text("sku"),
  category: text("category"),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  slug: text("slug"),
  externalUrl: text("external_url"),
  images: jsonb("images").$type<ProductImage[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("products_user_id_idx").on(table.userId),
]);
```

- [ ] **Step 2: Run type check**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add backend/src/db/schema.ts
git commit -m "feat: add products table to Drizzle schema"
```

---

## Task 2: Generate and run migration

**Files:**
- Create: `backend/drizzle/0001_*.sql` (auto-generated)

- [ ] **Step 1: Generate migration**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bunx drizzle-kit generate
```

Expected: creates `backend/drizzle/0001_*.sql` with `CREATE TABLE "products"`.

- [ ] **Step 2: Apply migration via docker exec**

```bash
# Get the generated SQL file name
SQL_FILE=$(ls /mnt/data/workspace/Web/JavaScript/catalog-app/backend/drizzle/0001_*.sql)

# Copy into container and apply
docker cp "$SQL_FILE" catalog-postgres:/tmp/migration.sql
docker exec catalog-postgres psql -U catalog_user -d catalog_app -f /tmp/migration.sql
```

Expected: `CREATE TABLE`, `CREATE INDEX` output with no errors.

- [ ] **Step 3: Verify table exists**

```bash
docker exec catalog-postgres psql -U catalog_user -d catalog_app -c "\d products"
```

Expected: table with columns id, user_id, name, description, price, sku, category, status, featured, slug, external_url, images, created_at.

- [ ] **Step 4: Commit**

```bash
git add backend/drizzle/
git commit -m "feat: add products table migration"
```

---

## Task 3: Products CRUD routes

**Files:**
- Modify: `backend/src/routes/products.ts`

- [ ] **Step 1: Replace products.ts**

```ts
import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db/index";
import { products } from "@/db/schema";
import { authMiddleware } from "@/middleware/auth";
import type { AuthVariables } from "@/middleware/auth";

const productsRouter = new Hono<{ Variables: AuthVariables }>();
productsRouter.use("*", authMiddleware);

productsRouter.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.userId, userId))
    .orderBy(desc(products.createdAt));
  return c.json(rows.map(toProduct));
});

productsRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json().catch(() => null);
  if (!body?.name) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  const [row] = await db
    .insert(products)
    .values({
      userId,
      name: body.name,
      description: body.description ?? "",
      price: String(body.price ?? 0),
      sku: body.sku ?? null,
      category: body.category ?? null,
      status: body.status ?? "draft",
      featured: body.featured ?? false,
      slug: body.slug ?? null,
      externalUrl: body.externalUrl ?? null,
      images: body.images ?? [],
    })
    .returning();
  return c.json(toProduct(row), 201);
});

productsRouter.get("/:id", async (c) => {
  const userId = c.get("userId");
  const [row] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, c.req.param("id")), eq(products.userId, userId)))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(toProduct(row));
});

productsRouter.put("/:id", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json().catch(() => null);
  const [existing] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, c.req.param("id")), eq(products.userId, userId)))
    .limit(1);
  if (!existing) return c.json({ error: "Not found" }, 404);
  const [row] = await db
    .update(products)
    .set({
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      price: body.price != null ? String(body.price) : existing.price,
      sku: body.sku ?? existing.sku,
      category: body.category ?? existing.category,
      status: body.status ?? existing.status,
      featured: body.featured ?? existing.featured,
      slug: body.slug ?? existing.slug,
      externalUrl: body.externalUrl ?? existing.externalUrl,
      images: body.images ?? existing.images,
    })
    .where(eq(products.id, c.req.param("id")))
    .returning();
  return c.json(toProduct(row));
});

productsRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const [existing] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, c.req.param("id")), eq(products.userId, userId)))
    .limit(1);
  if (!existing) return c.json({ error: "Not found" }, 404);
  await db.delete(products).where(eq(products.id, c.req.param("id")));
  return c.json({ ok: true });
});

function toProduct(row: typeof products.$inferSelect) {
  return {
    ...row,
    price: Number(row.price),
  };
}

export { productsRouter as products };
```

- [ ] **Step 2: Update the import in index.ts**

`backend/src/index.ts` imports `{ products }` from `@/routes/products`. The export name hasn't changed so no update needed — but verify the import still works:

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run check
```

Expected: no errors.

- [ ] **Step 3: Smoke test — list products (empty)**

Backend must be running. Start if needed:
```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run dev &
sleep 3
```

Get a token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | jq -r .token)
```

List products:
```bash
curl -s http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Expected: `[]`

- [ ] **Step 4: Smoke test — create + get + delete**

```bash
# Create
PRODUCT=$(curl -s -X POST http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Chair","description":"A chair","price":199,"status":"draft","featured":false,"images":[]}' | jq .)
echo $PRODUCT

# Get by ID
ID=$(echo $PRODUCT | jq -r .id)
curl -s http://localhost:3001/api/v1/products/$ID \
  -H "Authorization: Bearer $TOKEN" | jq .

# Delete
curl -s -X DELETE http://localhost:3001/api/v1/products/$ID \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Expected: create returns product with real UUID, get returns same product, delete returns `{ "ok": true }`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/products.ts
git commit -m "feat: replace mock products routes with real DB CRUD"
```

---

## Task 4: Products image presign and confirm

**Files:**
- Modify: `backend/src/routes/products.ts`

Add these two routes to `products.ts` before the `toProduct` helper (before `export`):

- [ ] **Step 1: Add import for MinIO at the top of products.ts**

Add to the imports section:
```ts
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { minioClient } from "@/lib/minio";
import { env } from "@/config/env";
```

- [ ] **Step 2: Add presign and confirm routes**

Add before the `toProduct` function:

```ts
productsRouter.post("/:id/images/presign", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.fileName || !body?.contentType) {
    return c.json({ error: "Missing fileName or contentType" }, 400);
  }
  const productId = c.req.param("id");
  const imageId = crypto.randomUUID();
  const key = `products/${productId}/${imageId}`;
  const command = new PutObjectCommand({
    Bucket: env.MINIO_BUCKET,
    Key: key,
    ContentType: body.contentType,
  });
  const uploadUrl = await getSignedUrl(minioClient, command, { expiresIn: 300 });
  return c.json({ uploadUrl, imageId });
});

productsRouter.post("/:id/images/confirm", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.imageId) {
    return c.json({ error: "Missing imageId" }, 400);
  }
  const productId = c.req.param("id");
  const url = `${env.MINIO_ENDPOINT}/${env.MINIO_BUCKET}/products/${productId}/${body.imageId}`;
  return c.json({ id: body.imageId, url, isCover: false });
});
```

- [ ] **Step 3: Type check**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run check
```

Expected: no errors.

- [ ] **Step 4: Smoke test presign**

```bash
curl -s -X POST http://localhost:3001/api/v1/products/new/images/presign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","contentType":"image/jpeg"}' | jq .
```

Expected: `{ "uploadUrl": "http://...", "imageId": "<uuid>" }`

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/products.ts
git commit -m "feat: implement MinIO presign and confirm for product images"
```

---

## Task 5: Dashboard stats route

**Files:**
- Modify: `backend/src/routes/dashboard.ts`

- [ ] **Step 1: Replace dashboard.ts**

```ts
import { Hono } from "hono";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/db/index";
import { products } from "@/db/schema";
import { authMiddleware } from "@/middleware/auth";
import type { AuthVariables } from "@/middleware/auth";

const dashboard = new Hono<{ Variables: AuthVariables }>();
dashboard.use("*", authMiddleware);

dashboard.get("/stats", async (c) => {
  const userId = c.get("userId");

  const [totalRow] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.userId, userId));

  const [publishedRow] = await db
    .select({ value: count() })
    .from(products)
    .where(and(eq(products.userId, userId), eq(products.status, "published")));

  const [draftRow] = await db
    .select({ value: count() })
    .from(products)
    .where(and(eq(products.userId, userId), eq(products.status, "draft")));

  return c.json({
    totalProducts: Number(totalRow.value),
    publishedProducts: Number(publishedRow.value),
    draftProducts: Number(draftRow.value),
    catalogViews: 0,
    productViews: 0,
    topProduct: null,
  });
});

export { dashboard };
```

- [ ] **Step 2: Type check**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run check
```

Expected: no errors.

- [ ] **Step 3: Smoke test**

```bash
curl -s http://localhost:3001/api/v1/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Expected: `{ "totalProducts": <number>, "publishedProducts": <number>, "draftProducts": <number>, "catalogViews": 0, "productViews": 0, "topProduct": null }`

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/dashboard.ts
git commit -m "feat: replace mock dashboard stats with real DB counts"
```

---

## Task 6: Analytics routes

**Files:**
- Modify: `backend/src/routes/analytics.ts`

- [ ] **Step 1: Replace analytics.ts**

```ts
import { Hono } from "hono";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/db/index";
import { products } from "@/db/schema";
import { authMiddleware } from "@/middleware/auth";
import type { AuthVariables } from "@/middleware/auth";

const analytics = new Hono<{ Variables: AuthVariables }>();
analytics.use("*", authMiddleware);

analytics.get("/overview", async (c) => {
  const userId = c.get("userId");
  const [publishedRow] = await db
    .select({ value: count() })
    .from(products)
    .where(and(eq(products.userId, userId), eq(products.status, "published")));

  return c.json({
    catalogViews: 0,
    productViews: 0,
    publishedProducts: Number(publishedRow.value),
    ctaClicks: 0,
  });
});

analytics.get("/products", async (c) => {
  const userId = c.get("userId");
  const rows = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(and(eq(products.userId, userId), eq(products.status, "published")));

  return c.json({
    items: rows.map((r) => ({ productId: r.id, title: r.name, views: 0 })),
  });
});

export { analytics };
```

- [ ] **Step 2: Type check**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run check
```

Expected: no errors.

- [ ] **Step 3: Smoke test**

```bash
curl -s http://localhost:3001/api/v1/analytics/overview \
  -H "Authorization: Bearer $TOKEN" | jq .

curl -s http://localhost:3001/api/v1/analytics/products \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Expected: overview with real publishedProducts count, products with empty or real items array.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/analytics.ts
git commit -m "feat: replace mock analytics with real DB counts"
```

---

## Task 7: Settings routes

**Files:**
- Modify: `backend/src/routes/settings.ts`

- [ ] **Step 1: Replace settings.ts**

```ts
import { Hono } from "hono";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { authMiddleware } from "@/middleware/auth";
import type { AuthVariables } from "@/middleware/auth";

const settings = new Hono<{ Variables: AuthVariables }>();
settings.use("*", authMiddleware);

settings.get("/", async (c) => {
  const userId = c.get("userId");
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json({
    companyName: user.companyName,
    companySlug: user.companySlug,
    name: user.name,
    email: user.email,
  });
});

settings.put("/company", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json().catch(() => null);
  if (!body?.companyName || !body?.companySlug) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  const [slugTaken] = await db
    .select()
    .from(users)
    .where(and(eq(users.companySlug, body.companySlug), ne(users.id, userId)))
    .limit(1);
  if (slugTaken) return c.json({ error: "Slug already taken" }, 409);

  const [updated] = await db
    .update(users)
    .set({ companyName: body.companyName, companySlug: body.companySlug })
    .where(eq(users.id, userId))
    .returning();
  return c.json({ companyName: updated.companyName, companySlug: updated.companySlug });
});

settings.put("/account", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json().catch(() => null);
  if (!body?.name) return c.json({ error: "Missing required fields" }, 400);
  const [updated] = await db
    .update(users)
    .set({ name: body.name })
    .where(eq(users.id, userId))
    .returning();
  return c.json({ name: updated.name });
});

export { settings };
```

- [ ] **Step 2: Type check**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run check
```

Expected: no errors.

- [ ] **Step 3: Smoke test**

```bash
# Get settings
curl -s http://localhost:3001/api/v1/settings \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Expected: `{ "companyName": "Test Co", "companySlug": "test-co", "name": "Test User", "email": "test@example.com" }`

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/settings.ts
git commit -m "feat: replace mock settings with real users table reads/writes"
```

---

## Task 8: Catalog route

**Files:**
- Modify: `backend/src/routes/catalog.ts`

- [ ] **Step 1: Replace catalog.ts**

```ts
import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/index";
import { users, products } from "@/db/schema";

const catalog = new Hono();

catalog.get("/:companySlug", async (c) => {
  const companySlug = c.req.param("companySlug");
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.companySlug, companySlug))
    .limit(1);
  if (!user) return c.json({ error: "Catalog not found" }, 404);

  const publishedProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.userId, user.id), eq(products.status, "published")))
    .orderBy(products.createdAt);

  return c.json({
    company: { name: user.companyName, description: null },
    products: publishedProducts.map((p) => ({ ...p, price: Number(p.price) })),
  });
});

export { catalog };
```

- [ ] **Step 2: Type check**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run check
```

Expected: no errors.

- [ ] **Step 3: Smoke test**

```bash
curl -s http://localhost:3001/api/v1/catalog/test-co | jq .
```

Expected: `{ "company": { "name": "Test Co", "description": null }, "products": [] }`

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/catalog.ts
git commit -m "feat: replace mock catalog with real DB query"
```

---

## Task 9: Auth — password change and account delete

**Files:**
- Modify: `backend/src/routes/auth.ts`

Add two routes after the existing `/logout` handler, before `export { auth }`:

- [ ] **Step 1: Add password change and account delete routes**

```ts
auth.put("/password", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json().catch(() => null);
  if (!body?.currentPassword || !body?.newPassword) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return c.json({ error: "User not found" }, 404);

  const valid = await bcrypt.compare(body.currentPassword, user.password);
  if (!valid) return c.json({ error: "Invalid current password" }, 401);

  const hashed = await bcrypt.hash(body.newPassword, 10);
  await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
  return c.json({ ok: true });
});

auth.delete("/account", authMiddleware, async (c) => {
  const userId = c.get("userId");
  await db.delete(users).where(eq(users.id, userId));
  return c.json({ ok: true });
});
```

- [ ] **Step 2: Type check**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app/backend && bun run check
```

Expected: no errors.

- [ ] **Step 3: Smoke test password change**

```bash
# Change password
curl -s -X PUT http://localhost:3001/api/v1/auth/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"password123","newPassword":"newpassword123"}' | jq .

# Verify new password works
curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"newpassword123"}' | jq .
```

Expected: password change returns `{ "ok": true }`, login with new password returns a token.

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/auth.ts
git commit -m "feat: add password change and account delete to auth routes"
```

---

## Task 10: Final type check and end-to-end smoke test

- [ ] **Step 1: Full type check**

```bash
cd /mnt/data/workspace/Web/JavaScript/catalog-app
bun run --cwd backend check && bun run --cwd frontend check
```

Expected: `ALL CLEAR` (no errors in either project).

- [ ] **Step 2: Full smoke test sequence**

```bash
# 1. Signup a fresh user
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"alice123","companyName":"Alice Co","companySlug":"alice-co"}' | jq -r .token)

# 2. Create a product
PROD=$(curl -s -X POST http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","description":"A widget","price":49.99,"status":"published","featured":true,"images":[]}')
echo "Created: $PROD"
ID=$(echo $PROD | jq -r .id)

# 3. List products — should have 1
curl -s http://localhost:3001/api/v1/products \
  -H "Authorization: Bearer $TOKEN" | jq 'length'
# Expected: 1

# 4. Dashboard stats
curl -s http://localhost:3001/api/v1/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" | jq .
# Expected: totalProducts:1, publishedProducts:1, draftProducts:0

# 5. Analytics
curl -s http://localhost:3001/api/v1/analytics/overview \
  -H "Authorization: Bearer $TOKEN" | jq .publishedProducts
# Expected: 1

# 6. Settings
curl -s http://localhost:3001/api/v1/settings \
  -H "Authorization: Bearer $TOKEN" | jq .companyName
# Expected: "Alice Co"

# 7. Public catalog
curl -s http://localhost:3001/api/v1/catalog/alice-co | jq '.products | length'
# Expected: 1

# 8. Unauthenticated catalog — published products only
curl -s http://localhost:3001/api/v1/catalog/alice-co | jq '.products[0].name'
# Expected: "Widget"
```

- [ ] **Step 3: Final commit**

```bash
git add backend/src/routes/products.ts backend/src/routes/dashboard.ts backend/src/routes/analytics.ts backend/src/routes/settings.ts backend/src/routes/catalog.ts backend/src/routes/auth.ts backend/src/db/schema.ts
git commit -m "feat: complete real data routes implementation"
```
