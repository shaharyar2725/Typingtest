import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, sessionsTable, avatarsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";
import { bearerToken, getUserFromToken, requireAuth } from "../lib/auth";

const router: IRouter = Router();

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(6).max(200),
  username: z.string().trim().min(2).max(20).regex(/^[a-zA-Z0-9_-]+$/, "Letters, numbers, _ and - only"),
  avatarId: z.number().int().positive(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  await db.insert(sessionsTable).values({ token, userId });
  return token;
}

async function userResponse(userId: number) {
  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      username: usersTable.username,
      avatarId: usersTable.avatarId,
      avatarUrl: avatarsTable.url,
    })
    .from(usersTable)
    .leftJoin(avatarsTable, eq(usersTable.avatarId, avatarsTable.id))
    .where(eq(usersTable.id, userId))
    .limit(1);
  return rows[0];
}

router.post("/auth/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { email, password, username, avatarId } = parsed.data;

  try {
    const existing = await db
      .select({ id: usersTable.id, email: usersTable.email, username: usersTable.username })
      .from(usersTable)
      .where(or(eq(usersTable.email, email), eq(usersTable.username, username)))
      .limit(1);
    if (existing[0]) {
      const conflict = existing[0].email === email ? "Email already registered" : "Username already taken";
      res.status(409).json({ error: conflict });
      return;
    }

    const av = await db.select().from(avatarsTable).where(eq(avatarsTable.id, avatarId)).limit(1);
    if (av.length === 0) {
      res.status(400).json({ error: "Pick an avatar" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const inserted = await db
      .insert(usersTable)
      .values({ email, username, passwordHash, avatarId })
      .returning({ id: usersTable.id });

    const token = await createSession(inserted[0].id);
    const user = await userResponse(inserted[0].id);
    res.json({ token, user });
  } catch (err) {
    req.log?.error({ err }, "signup failed");
    res.status(500).json({ error: "Sign up failed" });
  }
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;
  try {
    const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const ok = await bcrypt.compare(password, rows[0].passwordHash);
    if (!ok) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = await createSession(rows[0].id);
    const user = await userResponse(rows[0].id);
    res.json({ token, user });
  } catch (err) {
    req.log?.error({ err }, "login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/auth/logout", async (req, res) => {
  const token = bearerToken(req);
  if (token) {
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

router.put("/auth/avatar", requireAuth, async (req, res) => {
  const parsed = z.object({ avatarId: z.number().int().positive() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid avatar" });
    return;
  }
  const av = await db.select().from(avatarsTable).where(eq(avatarsTable.id, parsed.data.avatarId)).limit(1);
  if (av.length === 0) {
    res.status(400).json({ error: "Avatar not found" });
    return;
  }
  await db.update(usersTable).set({ avatarId: parsed.data.avatarId }).where(eq(usersTable.id, req.user!.id));
  const user = await userResponse(req.user!.id);
  res.json({ user });
});

export default router;
