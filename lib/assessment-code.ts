import type { Assessment } from './model';

/** New model codes belong to persistence, not editable form data. */
export function assessmentCode(
  record: Pick<Assessment, 'id' | 'code' | 'modelVersion'>,
): string {
  if (record.modelVersion === 'demo-0.1' && record.code) return record.code;
  return 'GC-' + record.id.slice(0, 6).toUpperCase();
}
