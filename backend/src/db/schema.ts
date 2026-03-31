import { pgTable, text, timestamp, uuid, numeric, boolean, jsonb, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name").notNull(),
  companySlug: text("company_slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductImage = { id: string; url: string; isCover: boolean };

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  sku: text("sku"),
  category: text("category"),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  slug: text("slug"),
  externalUrl: text("external_url"),
  images: jsonb("images").$type<ProductImage[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("products_user_id_idx").on(table.userId),
]);
