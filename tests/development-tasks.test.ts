import assert from 'node:assert/strict';
import test from 'node:test';
import { ageAt, ageLabel, ageMonthsLabel } from '../lib/patient';
import { calculateAssessment, categories, newAssessment } from '../lib/model';
import { validateAssessment } from '../lib/validation';
import { reportText } from '../lib/report';
import { recommendationFor } from '../lib/recommendation';

test('completed months respect the encounter day, leap years and month ends', () => {
  for (const [birth, visit, months] of [
    ['2023-07-16', '2026-09-16', 38],
    ['2023-07-16', '2026-09-15', 37],
    ['2023-10-19', '2026-09-19', 35],
    ['2023-10-19', '2026-10-19', 36],
    ['2024-02-29', '2025-02-28', 11],
    ['2024-02-29', '2025-03-01', 12],
    ['2026-01-31', '2026-02-28', 0],
    ['2026-09-16', '2026-09-16', 0],
  ] as const) {
    assert.equal(ageAt(birth, visit)?.months, months);
    assert.equal(ageAt(birth, visit)?.years, Math.floor(months / 12));
  }
  assert.equal(ageAt('2023-02-29', '2026-09-16'), null);
  assert.equal(ageAt('2026-09-17', '2026-09-16'), null);
  assert.equal(ageAt('2023-07-16', ''), null);
});

test('age labels switch at 36 months and use Russian plurals', () => {
  for (const [months, expected] of [
    [0, '0 месяцев'],
    [1, '1 месяц'],
    [2, '2 месяца'],
    [11, '11 месяцев'],
    [21, '21 месяц'],
    [22, '22 месяца'],
    [35, '35 месяцев'],
    [36, '3 года 0 месяцев'],
    [38, '3 года 2 месяца'],
    [60, '5 лет 0 месяцев'],
    [253, '21 год 1 месяц'],
    [266, '22 года 2 месяца'],
  ] as const)
    assert.equal(ageMonthsLabel(months), expected);
  assert.equal(ageMonthsLabel(null), '—');
  assert.equal(ageMonthsLabel(-1), '—');
});

test('age is normalized from assessment dates on save, reload and model input', () => {
  const record = newAssessment();
  record.patient.birthDate = '2023-07-16';
  record.visit.date = '2026-09-16';
  record.age = '99';
  record.ageMonths = 999;
  const saved = validateAssessment(record);
  assert.equal(saved.age, '3');
  assert.equal(saved.ageMonths, 38);
  assert.equal(calculateAssessment(record).inputs.ageMonths, 38);
  assert.equal(calculateAssessment(record).score, null);
  assert.equal(
    validateAssessment(JSON.parse(JSON.stringify(saved))).ageMonths,
    38,
  );
  const legacyPayload = JSON.parse(JSON.stringify(saved));
  delete legacyPayload.ageMonths;
  assert.equal(validateAssessment(legacyPayload).ageMonths, 38);
  record.visit.date = '2026-08-15';
  assert.equal(validateAssessment(record).ageMonths, 36);
  assert.equal(calculateAssessment(record).inputs.ageMonths, 36);
  record.visit.date = '';
  assert.equal(validateAssessment(record).ageMonths, null);
  assert.equal(calculateAssessment(record).inputs.ageMonths, null);
  assert.equal(ageLabel(record.patient.birthDate, record.visit.date), '—');
});

test('report and referral use the same age and never convert year-only legacy data to precise months', () => {
  const record = newAssessment();
  record.patient.birthDate = '2023-07-16';
  record.visit.date = '2026-09-16';
  for (const referral of [false, true]) {
    assert.match(reportText(record, referral), /Возраст: 3 года 2 месяца/);
  }
  record.patient.birthDate = '';
  record.modelVersion = 'demo-0.1';
  record.age = '3';
  assert.equal(validateAssessment(record).ageMonths, null);
  assert.equal(calculateAssessment(record).inputs.ageMonths, null);
  assert.match(reportText(record), /Возраст: 3 лет/);
});

test('provisional scale preserves the consultation trigger and identifies unapproved cutoffs', () => {
  for (const score of [
    0, 9, 9.9, 10, 24, 24.9, 25, 49, 49.9, 50, 74, 74.9, 75, 100,
  ]) {
    const result = recommendationFor(score);
    assert.equal(result.referralRecommended, score >= 25);
    assert.equal(result.score, score);
    assert.equal(
      result.level,
      score < 10 ? 0 : score < 25 ? 1 : score < 50 ? 2 : score < 75 ? 3 : 4,
    );
    assert.equal(result.thresholdsPending, false);
    assert.equal(result.thresholdsProvisional, true);
  }
  for (const score of [null, -1, 101, NaN, Infinity]) {
    const result = recommendationFor(score);
    assert.equal(result.score, null);
    assert.equal(result.level, null);
    assert.equal(result.referralRecommended, null);
  }
});

test('five-level mapping supports explicit cutoffs without changing the score', () => {
  const thresholds = { low: 10, borderline: 25, recommended: 50, urgent: 75 };
  for (const [score, level] of [
    [0, 0],
    [9, 0],
    [10, 1],
    [24, 1],
    [25, 2],
    [49, 2],
    [50, 3],
    [74, 3],
    [75, 4],
    [100, 4],
  ]) {
    const result = recommendationFor(score, thresholds);
    assert.equal(result.score, score);
    assert.equal(result.level, level);
    assert.equal(result.thresholdsPending, false);
    assert.equal(result.thresholdsProvisional, false);
    assert.equal(result.referralRecommended, level >= 2);
  }
  assert.throws(() => recommendationFor(10, { ...thresholds, low: 25 }));
  assert.throws(() => recommendationFor(90, { ...thresholds, urgent: 101 }));
});

test('provisional cutoffs are disclosed in exports and do not enable pending scoring', () => {
  const record = newAssessment();
  record.answers.neurodevelopment = {
    status: 'selected',
    selected: ['neurodevelopment-delay'],
  };
  const result = calculateAssessment(record);
  assert.equal(result.scoringPending, true);
  assert.equal(result.recommendation.score, null);
  assert.equal(result.recommendation.label, 'Не рассчитана');
  for (const referral of [false, true]) {
    assert.match(
      reportText(record, referral),
      /Предварительные пороги прототипа/,
    );
    assert.match(reportText(record, referral), /Клинически не утверждены/);
  }
});

test('criterion 06 copy changes preserve IDs, weights and the urgent flag', () => {
  const neuro = categories.find(
    (category) => category.id === 'neurodevelopment',
  )!;
  const [delay, regression] = neuro.criteria;
  assert.equal(delay.id, 'neurodevelopment-delay');
  assert.equal(delay.label, 'Задержка психомоторного развития');
  assert.equal(delay.points, 10);
  assert.equal(regression.points, 15);
  assert.match(regression.description, /Регресс на фоне реабилитации/);
  const record = newAssessment();
  record.answers.neurodevelopment = {
    status: 'selected',
    selected: [delay.id, regression.id],
  };
  record.modelVersion = 'demo-0.1';
  assert.equal(calculateAssessment(record).score, 15);
  assert.equal(calculateAssessment(record).urgent.length, 1);
});
