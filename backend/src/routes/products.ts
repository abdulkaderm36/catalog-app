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
