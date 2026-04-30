import type { Request, Response, NextFunction } from "express";
import { db, sessionsTable, usersTable, avatarsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
        avatarId: number | null;
        avatarUrl: string | null;
      };
    }
  }
}

export async function getUserFromToken(token: string) {
  const rows = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      username: usersTable.username,
      avatarId: usersTable.avatarId,
      avatarUrl: avatarsTable.url,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .leftJoin(avatarsTable, eq(usersTable.avatarId, avatarsTable.id))
    .where(eq(sessionsTable.token, token))
    .limit(1);
  return rows[0] ?? null;
}

export function bearerToken(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  const [scheme, value] = h.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !value) return null;
  return value;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }
  req.user = user;
  next();
}
