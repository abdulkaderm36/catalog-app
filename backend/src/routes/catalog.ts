import { Hono } from "hono";

const catalog = new Hono();

catalog.get("/:companySlug", (c) => {
  return c.json({
    companySlug: c.req.param("companySlug"),
    items: [
      { id: "prod_1", title: "Ridge Chair" },
      { id: "prod_2", title: "Atlas Desk Lamp" },
    ],
  });
});

export { catalog };
