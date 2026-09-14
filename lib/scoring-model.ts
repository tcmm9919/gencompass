/** Frozen legacy weights: never edit an existing model version to change history. */
export const demoWeights: Readonly<Record<string, number>> = Object.freeze({
  'onset-congenital': 10,
  'onset-infancy': 8,
  'onset-childhood': 5,
  'onset-adulthood': 0,
  'family-similar': 10,
  'family-confirmed': 20,
  'family-early-death': 10,
  'consanguinity-present': 10,
  'multisystem-two': 10,
  'multisystem-three': 15,
  'dysmorphology-minor': 5,
  'dysmorphology-congenital': 10,
  'neurodevelopment-delay': 10,
  'neurodevelopment-regression': 15,
  'treatment-poor-response': 5,
  'laboratory-acidosis': 10,
  'laboratory-hypoglycaemia': 10,
  'laboratory-hyperammonaemia': 15,
});

export type ModelVersion = 'demo-0.1' | 'review-0.2';
export const CURRENT_MODEL_VERSION: ModelVersion = 'review-0.2';

/** Null means not approved; it must not silently become a production coefficient. */
export const reviewModel = Object.freeze({
  version: 'review-0.2' as const,
  status: 'pending-clinical-approval' as const,
  label: 'Клиническая оценка · модель на согласовании',
  consanguinity: Object.freeze({
    target: 'family' as const,
    independentPoints: 0,
    multiplier: null as number | null,
  }),
  regression: Object.freeze({
    priority: 'highest' as const,
    points: null as number | null,
  }),
  treatmentEnhancement: Object.freeze({
    target: 'neurodevelopment' as const,
    multiplier: null as number | null,
    decision: 'under-review' as const,
  }),
  maximum: null as number | null,
  thresholds: null,
  pendingReasons: Object.freeze([
    'Множитель семейного анамнеза при кровном родстве родителей не утверждён.',
    'Максимальный вес регресса развития требует клинического утверждения.',
    'Роль резистентности к лечению в сочетании с неврологическими признаками уточняется.',
    'Максимум шкалы и пороги интерпретации новой модели не утверждены.',
  ]),
});

/** A modifier can only increase an existing family contribution, never create one. */
export function applyFamilyModifier(
  familyPoints: number,
  consanguinity: boolean,
  coefficient: number | null,
) {
  if (!Number.isFinite(familyPoints) || familyPoints < 0)
    throw new Error('Некорректный вклад семейного анамнеза.');
  if (
    coefficient !== null &&
    (!Number.isFinite(coefficient) || coefficient < 1)
  )
    throw new Error('Множитель должен быть конечным числом не меньше 1.');
  if (!consanguinity || familyPoints === 0)
    return { points: familyPoints, bonus: 0, pending: false };
  if (coefficient === null)
    return { points: familyPoints, bonus: 0, pending: true };
  const points = familyPoints * coefficient;
  return { points, bonus: points - familyPoints, pending: false };
}
