import { defineConfig } from "drizzle-kit";
import path from "path";

// Use DIRECT_URL for migrations — it bypasses PgBouncer (the connection pooler), which
// blocks session-level DDL statements that drizzle-kit needs.
// Falls back to DATABASE_URL for local development where no pooler is in use.
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "DIRECT_URL or DATABASE_URL must be set. Ensure the database is provisioned.",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
  out: "./migrations",
});
