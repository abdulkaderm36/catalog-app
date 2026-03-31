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
