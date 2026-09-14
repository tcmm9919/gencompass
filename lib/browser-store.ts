import { assessmentCode } from './assessment-code';
import type { Assessment } from './model';
import { validateAssessment } from './validation';

const prefix = 'gencompass-pages-assessment-v1:';

// One key per case keeps independent saves in different tabs from replacing
// the entire history. Only explicit saves write to persistent browser storage.
export function browserAssessmentStore(storage: Storage) {
  return {
    list(): Assessment[] {
      const records: Assessment[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (!key?.startsWith(prefix)) continue;
        const raw = storage.getItem(key);
        if (raw === null) continue;
        const record = validateAssessment(JSON.parse(raw));
        if (key !== prefix + record.id)
          throw new Error('Некорректная запись истории.');
        records.push(record);
      }
      return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    save(value: Assessment): Assessment {
      const record = validateAssessment(value);
      const saved = {
        ...record,
        code: assessmentCode(record),
        updatedAt: new Date().toISOString(),
      };
      storage.setItem(prefix + saved.id, JSON.stringify(saved));
      return saved;
    },
  };
}
