import type { MiddlewareHandler } from "hono";
import { verifyToken } from "@/lib/auth";

export type AuthVariables = { userId: string };

export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = header.slice(7);
  try {
    const userId = await verifyToken(token);
    c.set("userId", userId);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
};
