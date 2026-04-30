import { Router, type IRouter } from "express";
import { db, usersTable, scoresTable, avatarsTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { z } from "zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

const submitSchema = z.object({
  language: z.string().min(2).max(8),
  wpm: z.number().int().min(0).max(500),
  accuracy: z.number().int().min(0).max(100),
  errors: z.number().int().min(0).max(10000),
  mode: z.string().min(1).max(20),
  durationSec: z.number().int().min(1).max(7200),
});

router.post("/leaderboard/scores", requireAuth, async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid score" });
    return;
  }

  try {
    const inserted = await db
      .insert(scoresTable)
      .values({ ...parsed.data, userId: req.user!.id })
      .returning({ id: scoresTable.id });
    res.json({ id: inserted[0].id });
  } catch (err) {
    req.log?.error({ err }, "submit score failed");
    res.status(500).json({ error: "Failed to submit score" });
  }
});

const leaderboardQuerySchema = z.object({
  lang: z.string().min(2).max(8).default("en"),
});

router.get("/leaderboard", async (req, res) => {
  const parsed = leaderboardQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid language" });
    return;
  }
  const { lang } = parsed.data;

  try {
    const rows = await db
      .select({
        username: usersTable.username,
        avatarUrl: avatarsTable.url,
        wpm: sql<number>`max(${scoresTable.wpm})`.as("best_wpm"),
        accuracy: sql<number>`max(${scoresTable.accuracy})`.as("best_acc"),
        runs: sql<number>`count(${scoresTable.id})::int`.as("runs"),
      })
      .from(scoresTable)
      .innerJoin(usersTable, eq(scoresTable.userId, usersTable.id))
      .leftJoin(avatarsTable, eq(usersTable.avatarId, avatarsTable.id))
      .where(eq(scoresTable.language, lang))
      .groupBy(usersTable.username, avatarsTable.url)
      .orderBy(desc(sql`max(${scoresTable.wpm})`))
      .limit(20);

    res.json({ entries: rows, language: lang });
  } catch (err) {
    req.log?.error({ err }, "leaderboard fetch failed");
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

export default router;
