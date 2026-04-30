import { pgTable, serial, text, integer, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const avatarsTable = pgTable("tf_avatars", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  label: text("label").notNull(),
});

export const usersTable = pgTable("tf_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  username: text("username").notNull().unique(),
  avatarId: integer("avatar_id").references(() => avatarsTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionsTable = pgTable("tf_sessions", {
  token: text("token").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scoresTable = pgTable("tf_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  wpm: integer("wpm").notNull(),
  accuracy: integer("accuracy").notNull(),
  errors: integer("errors").notNull().default(0),
  mode: text("mode").notNull(),
  durationSec: integer("duration_sec").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  langWpmIdx: index("tf_scores_lang_wpm_idx").on(t.language, t.wpm),
  userLangIdx: uniqueIndex("tf_scores_user_lang_uidx").on(t.userId, t.language, t.wpm),
}));

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertScoreSchema = createInsertSchema(scoresTable).omit({ id: true, createdAt: true });
export const insertAvatarSchema = createInsertSchema(avatarsTable).omit({ id: true });

export type Avatar = typeof avatarsTable.$inferSelect;
export type User = typeof usersTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type Score = typeof scoresTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertScore = z.infer<typeof insertScoreSchema>;
