import { Hono } from "hono";
import { authMiddleware } from "@/middleware/auth";

const products = new Hono();

products.use("*", authMiddleware);

products.get("/", (c) => {
  return c.json([
    { id: "prod_1", name: "Ridge Chair", price: 349, status: "published", featured: true, createdAt: "2025-01-10T10:00:00Z" },
    { id: "prod_2", name: "Atlas Desk Lamp", price: 89, status: "draft", featured: false, createdAt: "2025-01-08T09:00:00Z" },
    { id: "prod_3", name: "Canvas Tote Bag", price: 45, status: "published", featured: false, createdAt: "2025-01-06T14:00:00Z" },
  ]);
});

products.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);

  return c.json(
    {
      message: "Create product route scaffolded.",
      received: body,
    },
    201,
  );
});

products.get("/:id", (c) => {
  return c.json({
    id: c.req.param("id"),
    title: "Ridge Chair",
    status: "published",
  });
});

products.patch("/:id", async (c) => {
  const body = await c.req.json().catch(() => null);

  return c.json({
    message: `Update product ${c.req.param("id")} route scaffolded.`,
    received: body,
  });
});

products.delete("/:id", (c) => {
  return c.json({
    message: `Delete product ${c.req.param("id")} route scaffolded.`,
  });
});

products.post("/:id/images/presign", async (c) => {
  const body = await c.req.json().catch(() => null);

  return c.json({
    message: "Presign route scaffolded for MinIO uploads.",
    productId: c.req.param("id"),
    received: body,
  });
});

export { products };
