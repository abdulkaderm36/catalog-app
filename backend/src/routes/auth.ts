import { Hono } from "hono";
import type { AuthVariables } from "@/middleware/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { signToken } from "@/lib/auth";
import { authMiddleware } from "@/middleware/auth";

const auth = new Hono<{ Variables: AuthVariables }>();

auth.post("/signup", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.name || !body?.companyName || !body?.companySlug) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Email already in use" }, 409);
  }

  const slugTaken = await db.select().from(users).where(eq(users.companySlug, body.companySlug)).limit(1);
  if (slugTaken.length > 0) {
    return c.json({ error: "Company slug already taken" }, 409);
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);
  const [user] = await db
    .insert(users)
    .values({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      companyName: body.companyName,
      companySlug: body.companySlug,
    })
    .returning();

  const token = await signToken(user.id);
  return c.json({ token }, 201);
});

auth.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await bcrypt.compare(body.password, user.password);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await signToken(user.id);
  return c.json({ token });
});

auth.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json({
    id: user.id,
    name: user.name,
    email: user.email,
    companyName: user.companyName,
    companySlug: user.companySlug,
  });
});

auth.post("/logout", (c) => {
  return c.json({ ok: true });
});

export { auth };
