import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Platform-level table — NOT tenant-scoped, no RLS policy (it defines tenants themselves).
export const tenant = pgTable('tenant', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  aisheCode: text('aishe_code'),
  subdomain: text('subdomain').notNull().unique(),
  isolationTier: text('isolation_tier').notNull().default('standard'), // 'standard' | 'enterprise'
  branding: jsonb('branding').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
