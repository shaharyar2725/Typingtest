// Production migration runner.
// Uses the DIRECT_URL (non-pooled) to bypass PgBouncer, which blocks DDL operations.
// Run with: pnpm --filter @workspace/db run migrate
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  throw new Error("DIRECT_URL or DATABASE_URL must be set for running migrations.");
}

const pool = new pg.Pool({ connectionString: url, max: 1 });
const db = drizzle(pool);

console.log("Running migrations…");
await migrate(db, { migrationsFolder: path.join(__dirname, "../migrations") });
console.log("✓ Migrations complete");

await pool.end();
