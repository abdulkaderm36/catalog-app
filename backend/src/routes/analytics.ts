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
