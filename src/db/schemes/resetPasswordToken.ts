import {
  pgTable,
  timestamp,
  varchar,
  serial,
  integer,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { usersData } from "./usersData";

export const PasswordRejectToken = pgTable(
  "password_reject_token",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => usersData.Id),
    is_verified: boolean().default(false),
    token: varchar("token", { length: 255 }).notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp().defaultNow(),
  },
  (table) => [index("reset_password_id_index").on(table.user_id)]
);

export type ResetToken = typeof PasswordRejectToken;
