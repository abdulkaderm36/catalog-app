import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@/db/index";
import { products } from "@/db/schema";
import { authMiddleware } from "@/middleware/auth";
import type { AuthVariables } from "@/middleware/auth";
import { minioClient } from "@/lib/minio";
import { env } from "@/config/env";

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
  if (!body) return c.json({ error: "Missing required fields" }, 400);
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
      sku: "sku" in body ? body.sku : existing.sku,
      category: "category" in body ? body.category : existing.category,
      status: body.status ?? existing.status,
      featured: body.featured ?? existing.featured,
      slug: "slug" in body ? body.slug : existing.slug,
      externalUrl: "externalUrl" in body ? body.externalUrl : existing.externalUrl,
      images: body.images ?? existing.images,
    })
    .where(and(eq(products.id, c.req.param("id")), eq(products.userId, userId)))
    .returning();
  return c.json(toProduct(row));
});

productsRouter.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const [deleted] = await db
    .delete(products)
    .where(and(eq(products.id, c.req.param("id")), eq(products.userId, userId)))
    .returning({ id: products.id });
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});

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

function toProduct(row: typeof products.$inferSelect) {
  return {
    ...row,
    price: Number(row.price),
  };
}

export { productsRouter as products };
