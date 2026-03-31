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
