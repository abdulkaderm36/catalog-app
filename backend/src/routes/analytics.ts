import { Hono } from "hono";
import { authMiddleware } from "@/middleware/auth";

const analytics = new Hono();

analytics.use("*", authMiddleware);

analytics.get("/overview", (c) => {
  return c.json({
    catalogViews: 12480,
    productViews: 38210,
    publishedProducts: 124,
    ctaClicks: 1204,
  });
});

analytics.get("/products", (c) => {
  return c.json({
    items: [
      { productId: "prod_1", title: "Ridge Chair", views: 8210 },
      { productId: "prod_2", title: "Atlas Desk Lamp", views: 6110 },
    ],
  });
});

export { analytics };
