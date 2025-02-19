import {
  pgTable,
  serial,
  integer,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import "./usersData";
import { usersData } from "./usersData";
export const refreshToken = pgTable(
  "refresh_token",
  {
    id: serial("id").primaryKey(),
    user_id: integer()
      .notNull()
      .references(() => usersData.Id),
    token: varchar().notNull(),
    created_at: timestamp().defaultNow().notNull(),
    updated_at: timestamp().defaultNow(),
  },
  (table) => [index("refresh_token_id_index").on(table.user_id)]
);

export type RefreshToken = typeof refreshToken;
