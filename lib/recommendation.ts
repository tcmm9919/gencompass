/** Presentation levels are separate from the frozen scoring formula. */
export const recommendationLevels = [
  'Не показана',
  'Низкая',
  'Пограничная',
  'Рекомендована',
  'Срочная',
] as const;

export type RecommendationThresholds = {
  low: number | null;
  borderline: number;
  recommended: number;
  urgent: number | null;
};

// Provisional prototype cutoffs requested by the product owner.
// These are not clinically validated; the pending scoring model stays disabled.
export const provisionalThresholdsNote =
  'Предварительные пороги прототипа: 0–9 / 10–24 / 25–49 / 50–74 / 75–100. Клинически не утверждены.';

export const recommendationThresholds: RecommendationThresholds = Object.freeze(
  {
    low: 10,
    borderline: 25,
    recommended: 50,
    urgent: 75,
  },
);

export function recommendationFor(
  score: number | null,
  thresholds = recommendationThresholds,
) {
  const { low, borderline, recommended, urgent } = thresholds;
  if (
    !Number.isFinite(borderline) ||
    !Number.isFinite(recommended) ||
    borderline <= 0 ||
    borderline >= recommended ||
    recommended >= 100 ||
    (low !== null &&
      (!Number.isFinite(low) || low <= 0 || low >= borderline)) ||
    (urgent !== null &&
      (!Number.isFinite(urgent) || urgent <= recommended || urgent > 100))
  )
    throw new Error('Некорректные пороги рекомендации.');
  const value =
    score !== null && Number.isFinite(score) && score >= 0 && score <= 100
      ? score
      : null;
  const level =
    value === null
      ? null
      : value < borderline
        ? low === null
          ? null
          : value < low
            ? 0
            : 1
        : value < recommended
          ? 2
          : urgent === null
            ? null
            : value < urgent
              ? 3
              : 4;
  return {
    score: value,
    level,
    label:
      value === null
        ? 'Не рассчитана'
        : level === null
          ? 'Уровень уточняется'
          : recommendationLevels[level],
    referralRecommended: value === null ? null : value >= borderline,
    thresholdsPending: low === null || urgent === null,
    thresholdsProvisional: thresholds === recommendationThresholds,
  };
}
