import type { Assessment } from './model';
import { validateAssessment } from './validation';
import { browserAssessmentStore } from './browser-store';

declare const __GENCOMPASS_STATIC__: boolean;
export const browserStorageMode =
  typeof __GENCOMPASS_STATIC__ !== 'undefined' && __GENCOMPASS_STATIC__;

export async function loadSavedAssessments(): Promise<Assessment[]> {
  if (browserStorageMode) {
    try {
      return browserAssessmentStore(window.localStorage).list();
    } catch {
      throw new Error(
        'Не удалось прочитать историю в этом браузере. Проверьте доступ к хранилищу.',
      );
    }
  }
  const response = await fetch('/api/assessments', {
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });
  const data = (await response.json()) as {
    error?: string;
    assessments: unknown[];
  };
  if (!response.ok)
    throw new Error(data.error || 'Не удалось загрузить историю.');
  return data.assessments.map((item: unknown) => validateAssessment(item));
}

export async function persistAssessment(
  value: Assessment,
): Promise<Assessment> {
  const record = validateAssessment(value);
  if (browserStorageMode) {
    try {
      return browserAssessmentStore(window.localStorage).save(record);
    } catch {
      throw new Error(
        'Не удалось сохранить в браузере: хранилище недоступно или заполнено. Ваш ввод остаётся на экране.',
      );
    }
  }
  const response = await fetch('/api/assessments', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  const data = (await response.json()) as {
    error?: string;
    assessment: unknown;
  };
  if (!response.ok)
    throw new Error(data.error || 'Не удалось сохранить оценку.');
  return validateAssessment(data.assessment);
}
