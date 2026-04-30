import { Router, type IRouter } from "express";
import { db, usersTable, scoresTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";

const router: IRouter = Router();

const claimSchema = z.object({
  username: z.string().trim().min(2).max(20).regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only"),
});

router.post("/leaderboard/claim", async (req, res) => {
  const parsed = claimSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid username" });
    return;
  }
  const { username } = parsed.data;

  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }

    const token = randomBytes(24).toString("hex");
    const inserted = await db
      .insert(usersTable)
      .values({ username, token })
      .returning();

    res.json({ username: inserted[0].username, token: inserted[0].token });
  } catch (err) {
    req.log?.error({ err }, "Failed to claim username");
    res.status(500).json({ error: "Failed to claim username" });
  }
});

const submitSchema = z.object({
  token: z.string().min(1),
  wpm: z.number().int().min(0).max(500),
  accuracy: z.number().int().min(0).max(100),
  errors: z.number().int().min(0).max(10000),
  mode: z.string().min(1).max(20),
  durationSec: z.number().int().min(1).max(7200),
});

router.post("/leaderboard/scores", async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid score" });
    return;
  }
  const { token, ...score } = parsed.data;

  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.token, token)).limit(1);
    if (user.length === 0) {
      res.status(401).json({ error: "Invalid session — please claim a username again" });
      return;
    }

    const inserted = await db
      .insert(scoresTable)
      .values({ ...score, userId: user[0].id })
      .returning();

    res.json({ id: inserted[0].id });
  } catch (err) {
    req.log?.error({ err }, "Failed to submit score");
    res.status(500).json({ error: "Failed to submit score" });
  }
});

router.get("/leaderboard", async (_req, res) => {
  try {
    // Top score per user, by WPM desc, top 20
    const rows = await db
      .select({
        username: usersTable.username,
        wpm: sql<number>`max(${scoresTable.wpm})`.as("best_wpm"),
        accuracy: sql<number>`max(${scoresTable.accuracy})`.as("best_acc"),
        runs: sql<number>`count(${scoresTable.id})::int`.as("runs"),
      })
      .from(scoresTable)
      .innerJoin(usersTable, eq(scoresTable.userId, usersTable.id))
      .groupBy(usersTable.username)
      .orderBy(desc(sql`max(${scoresTable.wpm})`))
      .limit(20);

    res.json({ entries: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

export default router;
