import { pgTable, serial, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const usersTable = pgTable("tf_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scoresTable = pgTable("tf_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  wpm: integer("wpm").notNull(),
  accuracy: integer("accuracy").notNull(),
  errors: integer("errors").notNull().default(0),
  mode: text("mode").notNull(),
  durationSec: integer("duration_sec").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  wpmIdx: index("tf_scores_wpm_idx").on(t.wpm),
}));

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertScoreSchema = createInsertSchema(scoresTable).omit({ id: true, createdAt: true });

export type User = typeof usersTable.$inferSelect;
export type Score = typeof scoresTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertScore = z.infer<typeof insertScoreSchema>;
