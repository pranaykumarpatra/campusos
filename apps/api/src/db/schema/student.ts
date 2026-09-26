import { pgTable, uuid, text, date, jsonb, timestamp, unique } from 'drizzle-orm/pg-core';
import { tenant } from './tenant.js';
import { section } from './org.js';

export const student = pgTable(
  'student',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull().references(() => tenant.id),
    enrolmentNo: text('enrolment_no').notNull(),
    sectionId: uuid('section_id').references(() => section.id),
    status: text('status').notNull().default('ACTIVE'), // ACTIVE | DETAINED | EXITED | GRADUATED | ...
    apaarId: text('apaar_id'), // ABC / APAAR reference only — never an Aadhaar number (BR, see doc V-04)
    admissionDate: date('admission_date'),
    custom: jsonb('custom').notNull().default({}), // tenant-defined fields (FR-ORG-06)
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('student_tenant_enrolment_unique').on(t.tenantId, t.enrolmentNo)],
);
