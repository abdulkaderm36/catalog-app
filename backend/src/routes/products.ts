import { Hono } from "hono";

const products = new Hono();

products.get("/", (c) => {
  return c.json({
    items: [
      { id: "prod_1", title: "Ridge Chair", status: "published" },
      { id: "prod_2", title: "Atlas Desk Lamp", status: "draft" },
    ],
  });
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
