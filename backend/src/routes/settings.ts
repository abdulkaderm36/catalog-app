import { Hono } from "hono";

const settings = new Hono();

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
