import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
export const assessments = sqliteTable(
  'assessments',
  {
    id: text('id').primaryKey(),
    payload: text('payload').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('assessments_updated_at_idx').on(table.updatedAt)],
);
