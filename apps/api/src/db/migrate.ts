/**
 * Runs Drizzle's own schema migrations, then applies the hand-written Row-Level
 * Security policies from src/db/policies/rls.sql. RLS lives outside Drizzle's
 * migration journal because it isn't expressible in the Drizzle schema DSL and
 * must not be touched by `drizzle-kit generate`.
 *
 * Usage: npm run db:setup
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// package.json sets "type": "module", so __dirname is not available here.
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Running Drizzle schema migrations...');
  await migrate(db, { migrationsFolder: join(__dirname, 'migrations') });

  console.log('Applying Row-Level Security policies...');
  const rls = readFileSync(join(__dirname, 'policies', 'rls.sql'), 'utf-8');
  await pool.query(rls);

  console.log('Database setup complete.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
