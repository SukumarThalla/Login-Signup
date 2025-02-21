import {
  pgTable,
  text,
  serial,
  varchar,
  timestamp,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const ProductTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stockQuantity").notNull().default(0),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  imageUrl: varchar("image", { length: 500000 }),
});

export type Product = InferSelectModel<typeof ProductTable>;
export type NewProduct = InferInsertModel<typeof ProductTable>;
