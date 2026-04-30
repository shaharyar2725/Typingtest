import { db, avatarsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

const DEFAULT_AVATARS: { url: string; label: string }[] = [
  { url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix", label: "Felix" },
  { url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka", label: "Aneka" },
  { url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper", label: "Jasper" },
  { url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna", label: "Luna" },
  { url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo", label: "Milo" },
  { url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Nora", label: "Nora" },
  { url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Otto", label: "Otto" },
  { url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Pip", label: "Pip" },
];

export async function seedAvatars() {
  try {
    const existing = await db.select({ count: sql<number>`count(*)::int` }).from(avatarsTable);
    if ((existing[0]?.count ?? 0) > 0) return;
    await db.insert(avatarsTable).values(DEFAULT_AVATARS);
    logger.info({ count: DEFAULT_AVATARS.length }, "seeded default avatars");
  } catch (err) {
    logger.error({ err }, "failed to seed avatars");
  }
}
