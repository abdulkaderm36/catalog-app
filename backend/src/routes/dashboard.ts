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
