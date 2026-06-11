import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { CartItem } from "@/app/lib/preorders/types";

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const discounts = pgTable("discounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: varchar("type", { length: 16 }).notNull(),
  value: doublePrecision("value").notNull(),
  scope: varchar("scope", { length: 16 }).notNull(),
  code: varchar("code", { length: 64 }),
  productIds: jsonb("product_ids").$type<string[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const preorders = pgTable("preorders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  fulfillmentType: varchar("fulfillment_type", { length: 16 })
    .notNull()
    .default("delivery"),
  customerLocation: text("customer_location"),
  customerNotes: text("customer_notes"),
  items: jsonb("items").$type<CartItem[]>().notNull(),
  subtotalLabel: varchar("subtotal_label", { length: 64 }),
  discountLabel: varchar("discount_label", { length: 64 }),
  discountCode: varchar("discount_code", { length: 64 }),
  discountId: uuid("discount_id").references(() => discounts.id, {
    onDelete: "set null",
  }),
  totalLabel: varchar("total_label", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  source: varchar("source", { length: 32 }).notNull().default("site_cart"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const products = pgTable("products", {
  id: varchar("id", { length: 32 }).primaryKey(),
  name: text("name").notNull(),
  price: varchar("price", { length: 32 }).notNull(),
  image: text("image").notNull(),
  hoverImage: text("hover_image"),
  tag: text("tag"),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  category: text("category"),
  homeSection: integer("home_section"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  status: varchar("status", { length: 16 }).notNull().default("active"),
  mustResetPassword: boolean("must_reset_password").notNull().default(true),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const adminPasswordTokens = pgTable("admin_password_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
export type Preorder = typeof preorders.$inferSelect;
export type ProductRecord = typeof products.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type AdminPasswordToken = typeof adminPasswordTokens.$inferSelect;
