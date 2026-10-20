import {
  emptyPatient,
  emptyVisit,
  localDate,
  ageAt,
  type Patient,
  type Visit,
} from './patient';
import data from './clinical-data.json';
import { recommendationFor } from './recommendation';
import {
  CURRENT_MODEL_VERSION,
  demoWeights,
  reviewModel,
  applyFamilyModifier,
  type ModelVersion,
} from './scoring-model';
export type { ModelVersion } from './scoring-model';
export type Criterion = {
  id: string;
  label: string;
  description: string;
  points: number;
  urgent?: string;
};
export type Category = {
  id: string;
  title: string;
  description: string;
  mode: string;
  sourceIds: string[];
  criteria: Criterion[];
};
export const categories: Category[] = data.categories;
export const sources = data.sources;
export type Answer = {
  status: 'selected' | 'none' | 'unknown' | 'normal';
  selected: string[];
};
export type Answers = Record<string, Answer>;
export type Assessment = {
  id: string;
  code: string;
  age: string;
  /** Completed months at visit.date; age is retained in years for old records. */
  ageMonths: number | null;
  notes: string;
  patient: Patient;
  visit: Visit;
  answers: Answers;
  status: 'draft' | 'complete';
  updatedAt: string;
  modelVersion: ModelVersion;
};
export function calculate(answers: Answers) {
  const contributions = categories.map((category) => {
    const answer = answers[category.id];
    const selected =
      answer?.status === 'selected'
        ? category.criteria
            .filter((c) => answer.selected.includes(c.id))
            .map((criterion) => ({
              ...criterion,
              points: demoWeights[criterion.id] ?? 0,
            }))
        : [];
    return {
      category,
      selected,
      points: Math.max(0, ...selected.map((c) => c.points)),
    };
  });
  const score = contributions.reduce((sum, item) => sum + item.points, 0);
  const reviewed = categories.filter((c) => answers[c.id]).length;
  const known = categories.filter(
    (c) => answers[c.id] && answers[c.id].status !== 'unknown',
  ).length;
  const selectedCount = contributions.reduce(
    (sum, c) => sum + c.selected.length,
    0,
  );
  return {
    contributions,
    score,
    reviewed,
    known,
    selectedCount,
    hasData: known > 0,
    zone:
      known === 0
        ? 'empty'
        : score < 25
          ? 'low'
          : score < 50
            ? 'moderate'
            : 'high',
    urgent: contributions.flatMap((c) => c.selected.filter((s) => s.urgent)),
  };
}
/** Version-aware entry point for all saved, displayed and exported assessments. */
export function calculateAssessment(
  record: Pick<Assessment, 'answers' | 'modelVersion'> &
    Partial<Pick<Assessment, 'patient' | 'visit'>>,
) {
  // Dates are authoritative. Never infer precise months from legacy whole years
  // or trust a cached age after an assessment date has changed.
  const inputs = {
    ageMonths:
      ageAt(record.patient?.birthDate ?? '', record.visit?.date ?? '')
        ?.months ?? null,
  };
  const legacy = calculate(record.answers);
  if (record.modelVersion === 'demo-0.1')
    return {
      ...legacy,
      inputs,
      modelVersion: record.modelVersion,
      scoringPending: false,
      modelLabel: 'Демонстрационная модель 0.1',
      pendingReasons: [] as string[],
      publishedScore: legacy.hasData ? legacy.score : null,
      recommendation: recommendationFor(legacy.hasData ? legacy.score : null),
      familyModifier: {
        points: legacy.contributions.find((c) => c.category.id === 'family')!
          .points,
        bonus: 0,
        pending: false,
      },
    };
  if (record.modelVersion !== 'review-0.2')
    throw new Error('Версия модели не поддерживается.');
  const consanguinity = legacy.contributions.some(
    (c) => c.category.id === 'consanguinity' && c.selected.length > 0,
  );
  const familyPoints = legacy.contributions.find(
    (c) => c.category.id === 'family',
  )!.points;
  const familyModifier = applyFamilyModifier(
    familyPoints,
    consanguinity,
    reviewModel.consanguinity.multiplier,
  );
  const contributions = legacy.contributions.map((item) => {
    if (item.category.id === 'consanguinity')
      return {
        ...item,
        points: 0,
        selected: item.selected.map((c) => ({ ...c, points: 0 })),
      };
    if (item.category.id === 'family')
      return { ...item, points: familyModifier.points };
    if (item.category.id === 'neurodevelopment') {
      const selected = item.selected.map((c) =>
        c.id === 'neurodevelopment-regression'
          ? { ...c, points: reviewModel.regression.points ?? 0 }
          : c,
      );
      return {
        ...item,
        selected,
        points: Math.max(0, ...selected.map((c) => c.points)),
      };
    }
    return item;
  });
  return {
    ...legacy,
    inputs,
    contributions,
    // No numerical index is released before clinical approval.
    score: null,
    zone: legacy.hasData ? 'pending' : 'empty',
    modelVersion: record.modelVersion,
    scoringPending: true,
    modelLabel: reviewModel.label,
    pendingReasons: [...reviewModel.pendingReasons],
    publishedScore: null,
    recommendation: recommendationFor(null),
    familyModifier,
  };
}

export function toggleCriterion(
  answers: Answers,
  category: Category,
  id: string,
): Answers {
  const before = answers[category.id]?.selected ?? [];
  const selected = before.includes(id)
    ? before.filter((x) => x !== id)
    : category.mode === 'single'
      ? [id]
      : [...before, id];
  const next = { ...answers };
  if (!selected.length) delete next[category.id];
  else next[category.id] = { status: 'selected', selected };
  return next;
}
export function newAssessment(): Assessment {
  return {
    id: crypto.randomUUID(),
    code: '',
    age: '',
    ageMonths: null,
    notes: '',
    patient: { ...emptyPatient },
    visit: { ...emptyVisit, date: localDate() },
    answers: {},
    status: 'draft',
    updatedAt: '',
    modelVersion: CURRENT_MODEL_VERSION,
  };
}
export const zoneNames: Record<string, string> = {
  empty: 'Ожидает данных',
  pending: 'Модель на согласовании',
  low: 'Низкий демо-индекс',
  moderate: 'Средний демо-индекс',
  high: 'Высокий демо-индекс',
};
