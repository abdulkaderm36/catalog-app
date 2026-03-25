import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Hono } from "hono";

import { env } from "@/config/env";
import { analytics } from "@/routes/analytics";
import { auth } from "@/routes/auth";
import { catalog } from "@/routes/catalog";
import { products } from "@/routes/products";
import { settings } from "@/routes/settings";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: env.APP_URL,
    credentials: true,
  }),
);

app.get("/", (c) => {
  return c.json({
    name: "catalog-api",
    status: "ok",
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    storage: "minio",
  });
});

app.route("/api/v1/auth", auth);
app.route("/api/v1/products", products);
app.route("/api/v1/catalog", catalog);
app.route("/api/v1/analytics", analytics);
app.route("/api/v1/settings", settings);

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`);
  },
);

export default app;
