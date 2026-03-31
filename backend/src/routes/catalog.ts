import { Hono } from "hono";

const catalog = new Hono();

catalog.get("/:companySlug", (c) => {
  return c.json({
    company: { name: "Demo Company", description: "Quality products for everyday life." },
    products: [
      { id: "prod_1", name: "Ridge Chair", price: 349, status: "published", category: "furniture", featured: true },
      { id: "prod_2", name: "Atlas Desk Lamp", price: 89, status: "published", category: "lighting", featured: false },
      { id: "prod_3", name: "Canvas Tote Bag", price: 45, status: "published", category: "accessories", featured: false },
    ],
  });
});

export { catalog };
