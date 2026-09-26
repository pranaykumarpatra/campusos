import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { tenant } from './tenant.js';

// Every tenant-owned table below follows the Section 10.2 pattern:
// a tenant_id FK + a FORCE ROW LEVEL SECURITY policy applied in migrations/0000_rls.sql

export const programme = pgTable('programme', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // UG_3YR | UG_4YR_HONOURS | PG | DIPLOMA | PHD
  durationYears: integer('duration_years').notNull(),
  regulation: text('regulation').notNull(),
  affiliatingUniversity: text('affiliating_university'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const batch = pgTable('batch', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  programmeId: uuid('programme_id').notNull().references(() => programme.id),
  admissionYear: integer('admission_year').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const section = pgTable('section', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
  batchId: uuid('batch_id').notNull().references(() => batch.id),
  name: text('name').notNull(), // e.g. "A", "B"
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
