import {
  emptyPatient,
  emptyVisit,
  localDate,
  type Patient,
  type Visit,
} from './patient';
import data from './clinical-data.json';
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
  status: 'selected' | 'none' | 'unknown';
  selected: string[];
};
export type Answers = Record<string, Answer>;
export type Assessment = {
  id: string;
  code: string;
  age: string;
  notes: string;
  patient: Patient;
  visit: Visit;
  answers: Answers;
  status: 'draft' | 'complete';
  updatedAt: string;
  modelVersion: 'demo-0.1';
};
export function calculate(answers: Answers) {
  const contributions = categories.map((category) => {
    const answer = answers[category.id];
    const selected =
      answer?.status === 'selected'
        ? category.criteria.filter((c) => answer.selected.includes(c.id))
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
    notes: '',
    patient: { ...emptyPatient },
    visit: { ...emptyVisit, date: localDate() },
    answers: {},
    status: 'draft',
    updatedAt: '',
    modelVersion: 'demo-0.1',
  };
}
export const zoneNames: Record<string, string> = {
  empty: 'Ожидает данных',
  low: 'Низкий демо-индекс',
  moderate: 'Средний демо-индекс',
  high: 'Высокий демо-индекс',
};
