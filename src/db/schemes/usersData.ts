import {
  pgTable,
  timestamp,
  varchar,
  serial,
  boolean,
} from "drizzle-orm/pg-core";

export const usersData = pgTable("users_Data", {
  Id: serial("Id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  gender: varchar("gender", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  is_verified: boolean().default(false),
});
