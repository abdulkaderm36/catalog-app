import { Hono } from "hono";

const auth = new Hono();

auth.post("/signup", async (c) => {
  const body = await c.req.json().catch(() => null);

  return c.json(
    {
      message: "Signup route scaffolded.",
      received: body,
    },
    201,
  );
});

auth.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);

  return c.json({
    message: "Login route scaffolded.",
    received: body,
  });
});

auth.post("/refresh", (c) => {
  return c.json({ message: "Refresh token route scaffolded." });
});

auth.post("/logout", (c) => {
  return c.json({ message: "Logout route scaffolded." });
});

auth.get("/me", (c) => {
  return c.json({
    id: "demo-user",
    name: "Demo User",
    companySlug: "demo-company",
  });
});

export { auth };
