import { Hono } from "hono";
import { authMiddleware } from "@/middleware/auth";

const dashboard = new Hono();

dashboard.use("*", authMiddleware);

dashboard.get("/stats", (c) => {
  return c.json({
    totalProducts: 12,
    publishedProducts: 8,
    draftProducts: 4,
    catalogViews: 1248,
    productViews: 3821,
    topProduct: { name: "Ridge Chair", views: 821 },
  });
});

export { dashboard };
