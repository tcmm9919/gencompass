import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculate,
  calculateAssessment,
  newAssessment,
  type Assessment,
} from '../lib/model';
import { applyFamilyModifier, reviewModel } from '../lib/scoring-model';
import { validateAssessment } from '../lib/validation';
import { reportText } from '../lib/report';
import { registerClinicalTools } from '../lib/webmcp';

const selected = (...selected: string[]) => ({
  status: 'selected' as const,
  selected,
});
function completedReview(): Assessment {
  const record = newAssessment();
  return {
    ...record,
    patient: { ...record.patient, birthDate: '2020-01-01', sex: 'female' },
    visit: {
      ...record.visit,
      diagnosis: 'Задержка развития',
      date: '2026-09-14',
    },
    status: 'complete',
    answers: { neurodevelopment: selected('neurodevelopment-delay') },
  };
}

test('new assessments use an explicit review model without a numerical index or risk tier', () => {
  const record = newAssessment();
  assert.equal(record.modelVersion, 'review-0.2');
  const result = calculateAssessment(completedReview());
  assert.equal(result.scoringPending, true);
  assert.equal(result.score, null);
  assert.equal(result.publishedScore, null);
  assert.equal(result.zone, 'pending');
  assert.equal(reviewModel.consanguinity.multiplier, null);
  assert.equal(reviewModel.regression.points, null);
  assert.equal(reviewModel.maximum, null);
  assert.ok(result.pendingReasons.length > 0);
});

test('saved legacy cases retain their version and exact demo formula after validation', () => {
  const old: Assessment = {
    ...newAssessment(),
    modelVersion: 'demo-0.1',
    status: 'complete',
    answers: {
      consanguinity: selected('consanguinity-present'),
      neurodevelopment: selected('neurodevelopment-regression'),
    },
  };
  const restored = validateAssessment(JSON.parse(JSON.stringify(old)));
  const result = calculateAssessment(restored);
  assert.equal(restored.modelVersion, 'demo-0.1');
  assert.equal(restored.patient.birthDate, '');
  assert.equal(result.score, 25);
  assert.equal(result.zone, 'moderate');
  assert.equal(result.scoringPending, false);
  assert.deepEqual(result.contributions, calculate(old.answers).contributions);
  assert.equal(result.urgent.length, 1);
});

test('consanguinity alone has no independent contribution in review model', () => {
  const record = newAssessment();
  record.answers = { consanguinity: selected('consanguinity-present') };
  const result = calculateAssessment(record);
  assert.equal(
    result.contributions.find((c) => c.category.id === 'consanguinity')!.points,
    0,
  );
  assert.equal(
    result.contributions.reduce((sum, c) => sum + c.points, 0),
    0,
  );
  assert.equal(result.familyModifier.bonus, 0);
  assert.equal(result.score, null);
});

test('family modifier applies only to positive family history and never invents an unapproved multiplier', () => {
  // Explicit fixture coefficient tests the mechanism; production config stays null.
  assert.deepEqual(applyFamilyModifier(0, true, 1.25), {
    points: 0,
    bonus: 0,
    pending: false,
  });
  assert.deepEqual(applyFamilyModifier(20, false, 1.25), {
    points: 20,
    bonus: 0,
    pending: false,
  });
  assert.deepEqual(applyFamilyModifier(20, true, 1.25), {
    points: 25,
    bonus: 5,
    pending: false,
  });
  assert.deepEqual(applyFamilyModifier(20, true, null), {
    points: 20,
    bonus: 0,
    pending: true,
  });
  assert.throws(() => applyFamilyModifier(20, true, 0.5));
  assert.throws(() => applyFamilyModifier(-5, true, 1.25));
  assert.throws(() => applyFamilyModifier(20, true, Number.NaN));
});

test('normal laboratory results remain distinct from unknown and never imply low risk', () => {
  const record = completedReview();
  record.answers = { laboratory: { status: 'normal', selected: [] } };
  const normal = validateAssessment(record);
  assert.equal(normal.answers.laboratory.status, 'normal');
  const result = calculateAssessment(normal);
  assert.equal(result.known, 1);
  assert.equal(result.score, null);
  assert.equal(result.zone, 'pending');
  assert.equal(
    result.contributions.find((c) => c.category.id === 'laboratory')!.points,
    0,
  );
  record.answers = { laboratory: { status: 'unknown', selected: [] } };
  const draft = validateAssessment({ ...record, status: 'draft' });
  assert.equal(draft.answers.laboratory.status, 'unknown');
  assert.equal(calculateAssessment(draft).known, 0);
  assert.equal(calculateAssessment(draft).zone, 'empty');
  assert.throws(() => validateAssessment(record), /известными данными/);
  assert.throws(() =>
    validateAssessment({
      ...record,
      answers: { family: { status: 'normal', selected: [] } },
    }),
  );
  assert.throws(() =>
    validateAssessment({
      ...record,
      answers: { laboratory: { status: 'none', selected: [] } },
    }),
  );
});

test('pending score never suppresses regression or hyperammonaemia warnings', () => {
  const record = newAssessment();
  record.answers = {
    neurodevelopment: selected('neurodevelopment-regression'),
    laboratory: selected('laboratory-hyperammonaemia'),
  };
  const result = calculateAssessment(record);
  assert.equal(result.score, null);
  assert.equal(result.urgent.length, 2);
});

test('new required context applies at completion, partial drafts stay saveable', () => {
  assert.doesNotThrow(() => validateAssessment(newAssessment()));
  const record = completedReview();
  assert.doesNotThrow(() => validateAssessment(record));
  assert.throws(
    () =>
      validateAssessment({
        ...record,
        patient: { ...record.patient, birthDate: '' },
      }),
    /дату рождения/,
  );
  assert.throws(
    () =>
      validateAssessment({
        ...record,
        patient: { ...record.patient, sex: '' },
      }),
    /пол пациента/,
  );
  assert.throws(
    () =>
      validateAssessment({
        ...record,
        visit: { ...record.visit, diagnosis: '  ' },
      }),
    /причину оценки/,
  );
  assert.equal(validateAssessment({ ...newAssessment(), age: '40' }).age, '');
  assert.equal(validateAssessment(record).age, '6');
});

test('review-model exports explain pending scoring and normal laboratory status without legacy points', () => {
  const record = completedReview();
  record.answers.consanguinity = selected('consanguinity-present');
  record.answers.laboratory = { status: 'normal', selected: [] };
  const report = reportText(record, true);
  assert.match(report, /review-0.2/);
  assert.match(report, /не утверждены/);
  assert.match(report, /Норма на момент исследования/);
  assert.match(report, /самостоятельные баллы не начисляются/);
  assert.ok(!report.includes('/100'));
  assert.ok(!report.includes('(демовес'));
  assert.match(report, /Задержка развития/);
});

test('WebMCP stages review-model evidence without assigning an index', () => {
  let record = newAssessment();
  const tools: any[] = [];
  const cleanup = registerClinicalTools(
    () => record,
    (answers) => {
      record = { ...record, answers };
    },
    {
      registerTool(tool) {
        tools.push(tool);
      },
    },
  );
  const staged = tools[1].execute({
    answers: {
      laboratory: { status: 'normal', selected: [] },
      consanguinity: selected('consanguinity-present'),
    },
  });
  assert.equal(staged.staged, true);
  assert.equal(staged.result.score, null);
  assert.equal(staged.result.scoringPending, true);
  assert.equal(tools[0].execute({}).result.score, null);
  assert.equal(record.answers.laboratory.status, 'normal');
  cleanup!();
});
