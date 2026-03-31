import { Hono } from "hono";
import { authMiddleware } from "@/middleware/auth";

const settings = new Hono();

settings.use("*", authMiddleware);

settings.get("/", (c) => {
  return c.json({
    companySlug: "demo-company",
    showPrice: true,
    storageProvider: "minio",
  });
});

settings.patch("/", async (c) => {
  const body = await c.req.json().catch(() => null);

  return c.json({
    message: "Settings update route scaffolded.",
    received: body,
  });
});

export { settings };
