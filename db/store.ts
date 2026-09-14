import { assessmentCode } from '../lib/assessment-code';
import { env } from 'cloudflare:workers';
import { type Assessment } from '../lib/model';
export function assessmentDb() {
  if (!env.DB) throw new Error('Хранилище временно недоступно.');
  return env.DB;
}
export async function listAssessments() {
  const result = await assessmentDb()
    .prepare('SELECT payload FROM assessments ORDER BY updated_at DESC')
    .all<{ payload: string }>();
  return result.results.map((row) => JSON.parse(row.payload) as Assessment);
}
export async function saveAssessment(record: Assessment) {
  const saved = {
    ...record,
    code: assessmentCode(record),
    updatedAt: new Date().toISOString(),
  };
  await assessmentDb()
    .prepare(
      'INSERT INTO assessments (id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at',
    )
    .bind(saved.id, JSON.stringify(saved), saved.updatedAt)
    .run();
  return saved;
}
