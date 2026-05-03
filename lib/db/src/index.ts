import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import pg from "pg";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Vercel serverless: Neon's HTTP driver is stateless — each query is an HTTP request.
// This avoids exhausting the database's connection limit across many concurrent cold starts.
//
// Local dev: node-postgres with a connection pool gives full PostgreSQL feature support
// (interactive transactions, LISTEN/NOTIFY, etc.) and better performance.
//
// Both drivers are cast to NodePgDatabase<typeof schema> so the rest of the codebase
// uses a single consistent type with full query-builder support (including .returning()).
export const db: NodePgDatabase<typeof schema> = process.env.VERCEL
  ? (neonDrizzle(neon(url), { schema }) as unknown as NodePgDatabase<typeof schema>)
  : drizzle(new pg.Pool({ connectionString: url }), { schema });

export * from "./schema";
