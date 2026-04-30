import { Router, type IRouter } from "express";
import { db, avatarsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/avatars", async (_req, res) => {
  const rows = await db.select().from(avatarsTable).orderBy(avatarsTable.id);
  res.json({ avatars: rows });
});

export default router;
