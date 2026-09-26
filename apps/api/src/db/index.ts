import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as tenantSchema from './schema/tenant.js';
import * as orgSchema from './schema/org.js';
import * as studentSchema from './schema/student.js';

const schema = { ...tenantSchema, ...orgSchema, ...studentSchema };

// Always the non-owner app role (APP_DATABASE_URL), never the superuser
// connection used by db:setup -- see .env.example.
export const pool = new Pool({
  connectionString: process.env.APP_DATABASE_URL,
});

export const db = drizzle(pool, { schema });

/**
 * Runs a callback inside a transaction with the tenant set via SET LOCAL,
 * so PostgreSQL Row-Level Security policies filter every query to that
 * tenant only (Section 10.2 of the requirements document). Never query
 * tenant-owned tables outside of this helper.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function withTenant<T>(tenantId: string, fn: (tx: typeof db) => Promise<T>): Promise<T> {
  // Postgres does not support parameter binding on SET LOCAL, so the tenant id is
  // validated as a UUID here before interpolation to close the injection path.
  if (!UUID_RE.test(tenantId)) {
    throw new Error('Invalid tenant id');
  }
  return db.transaction(async (tx) => {
    await tx.execute(`SET LOCAL app.tenant_id = '${tenantId}'`);
    // The transaction handle has the same query surface as `db`; only $client
    // (the pool) differs, which callers inside withTenant never need.
    return fn(tx as unknown as typeof db);
  });
}
