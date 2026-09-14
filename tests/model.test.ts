import assert from 'node:assert/strict';
import test from 'node:test';
import {
  categories,
  calculate,
  newAssessment as createCurrentAssessment,
  toggleCriterion,
  type Answers,
} from '../lib/model';
import { validateAssessment } from '../lib/validation';
import { reportText } from '../lib/report';
import { registerClinicalTools } from '../lib/webmcp';
import './browser-store.test';
import './model-version.test';
import './clinician-profile.test';
// Existing tests below describe the frozen demonstration model.
const newAssessment = () => ({
  ...createCurrentAssessment(),
  modelVersion: 'demo-0.1' as const,
});
const selected = (...selected: string[]) => ({
  status: 'selected' as const,
  selected,
});

test('no input or only unknown answers cannot produce a reassuring low zone', () => {
  const empty = calculate({});
  assert.equal(empty.hasData, false);
  assert.equal(empty.zone, 'empty');
  assert.equal(empty.reviewed, 0);
  const unknown = calculate(
    Object.fromEntries(
      categories.map((c) => [c.id, { status: 'unknown', selected: [] }]),
    ),
  );
  assert.equal(unknown.hasData, false);
  assert.equal(unknown.known, 0);
  assert.equal(unknown.reviewed, 8);
  assert.equal(unknown.zone, 'empty');
});
test('an explicit negative answer is known and has a zero demo score', () => {
  const r = calculate({ family: { status: 'none', selected: [] } });
  assert.equal(r.score, 0);
  assert.equal(r.known, 1);
  assert.equal(r.reviewed, 1);
  assert.equal(r.hasData, true);
});
test('mutually exclusive alternatives replace one another without adding weights', () => {
  const cat = categories.find((c) => c.id === 'onset')!;
  let answers = toggleCriterion({}, cat, 'onset-congenital');
  answers = toggleCriterion(answers, cat, 'onset-infancy');
  assert.deepEqual(answers.onset.selected, ['onset-infancy']);
  assert.equal(calculate(answers).score, 8);
  answers = toggleCriterion(answers, cat, 'onset-infancy');
  assert.equal(calculate(answers).hasData, false);
});
test('related findings within one category contribute their maximum, not their sum', () => {
  const r = calculate({
    family: selected(
      'family-similar',
      'family-confirmed',
      'family-early-death',
    ),
  });
  assert.equal(r.score, 20);
  assert.equal(r.selectedCount, 3);
});
test('full valid selections have a bounded maximum of 100 and category contributions reconcile', () => {
  const answers: Answers = Object.fromEntries(
    categories.map((c) => [
      c.id,
      selected(c.criteria.reduce((a, b) => (a.points > b.points ? a : b)).id),
    ]),
  );
  const r = calculate(answers);
  assert.equal(r.score, 100);
  assert.equal(
    r.contributions.reduce((n, c) => n + c.points, 0),
    r.score,
  );
  assert.equal(r.known, 8);
  assert.equal(r.zone, 'high');
});
test('demonstration thresholds are inclusive at 25 and 50', () => {
  const zone = (answers: Answers) => calculate(answers).zone;
  assert.equal(zone({ family: selected('family-confirmed') }), 'low');
  assert.equal(
    zone({
      family: selected('family-confirmed'),
      treatment: selected('treatment-poor-response'),
    }),
    'moderate',
  );
  assert.equal(
    zone({
      family: selected('family-confirmed'),
      multisystem: selected('multisystem-three'),
      neurodevelopment: selected('neurodevelopment-regression'),
    }),
    'high',
  );
});
test('hyperammonaemia flag is present even with a numerically low total', () => {
  const r = calculate({ laboratory: selected('laboratory-hyperammonaemia') });
  assert.equal(r.score, 15);
  assert.equal(r.urgent.length, 1);
  assert.match(r.urgent[0].urgent!, /неотложное/);
});
test('malformed and conflicting payloads fail before persistence', () => {
  const record = newAssessment();
  assert.throws(() => validateAssessment({ ...record, age: '-1' }));
  assert.throws(() => validateAssessment({ ...record, age: '1.5' }));
  assert.throws(() => validateAssessment({ ...record, age: '121' }));
  assert.throws(() =>
    validateAssessment({ ...record, notes: 'a'.repeat(2001) }),
  );
  assert.throws(() =>
    validateAssessment({ ...record, modelVersion: 'clinical-approved' }),
  );
  assert.throws(() =>
    validateAssessment({ ...record, answers: { fake: selected('fake') } }),
  );
  assert.throws(() =>
    validateAssessment({
      ...record,
      answers: { family: selected('family-confirmed', 'family-confirmed') },
    }),
  );
  assert.throws(() =>
    validateAssessment({
      ...record,
      answers: { onset: selected('onset-congenital', 'onset-infancy') },
    }),
  );
  assert.throws(() =>
    validateAssessment({
      ...record,
      answers: { family: { status: 'none', selected: ['family-confirmed'] } },
    }),
  );
});
test('drafts allow incomplete input; finalized results require known input', () => {
  const record = newAssessment();
  assert.doesNotThrow(() => validateAssessment(record));
  assert.throws(() => validateAssessment({ ...record, status: 'complete' }));
  assert.throws(() =>
    validateAssessment({
      ...record,
      status: 'complete',
      answers: { onset: { status: 'unknown', selected: [] } },
    }),
  );
  assert.doesNotThrow(() =>
    validateAssessment({
      ...record,
      status: 'complete',
      answers: { onset: selected('onset-adulthood') },
    }),
  );
});
test('print and referral exports preserve missing vs unknown vs negative and model limitations', () => {
  const record = {
    ...newAssessment(),
    code: 'GC-TEST',
    answers: {
      onset: selected('onset-infancy'),
      family: { status: 'none' as const, selected: [] },
      treatment: { status: 'unknown' as const, selected: [] },
    },
  };
  const text = reportText(record, true, 'Обсудить семейный анамнез');
  assert.match(text, /ШАБЛОН НАПРАВЛЕНИЯ/);
  assert.match(text, /не валидированы/);
  assert.match(text, /Семейный анамнез: Признаки не выявлены/);
  assert.match(text, /Резистентность к лечению: Данных недостаточно/);
  assert.match(text, /Лабораторные red flags: Не заполнено/);
  assert.match(text, /8\/100/);
  assert.match(text, /Обсудить семейный анамнез/);
  assert.match(text, /https:\/\/pubmed/);
});
test('WebMCP tool contract registers, stages shared state, rejects invalid input, and cleans up', () => {
  let record = newAssessment();
  const tools: any[] = [];
  let signal: AbortSignal | undefined;
  const cleanup = registerClinicalTools(
    () => record,
    (answers) => {
      record = { ...record, answers };
    },
    {
      registerTool(tool, options) {
        tools.push(tool);
        signal = options.signal;
      },
    },
  );
  assert.equal(tools.length, 2);
  assert.equal(tools[0].annotations.readOnlyHint, true);
  assert.equal(tools[1].annotations.readOnlyHint, false);
  const result = tools[1].execute({
    answers: { onset: selected('onset-infancy') },
  });
  assert.equal(result.result.score, 8);
  assert.equal(tools[0].execute({}).result.score, 8);
  assert.throws(() =>
    tools[1].execute({ answers: { wrong: selected('bad') } }),
  );
  assert.equal(calculate(record.answers).score, 8);
  cleanup!();
  assert.equal(signal!.aborted, true);
});

test('fresh assessments have independent IDs and never claim a persisted timestamp', () => {
  const a = newAssessment();
  const b = newAssessment();
  assert.notEqual(a.id, b.id);
  assert.equal(a.updatedAt, '');
  assert.equal(a.status, 'draft');
});
test('patient and encounter fields survive validation and referral export', () => {
  const record = newAssessment();
  record.patient = {
    lastName: ' Тестовый ',
    firstName: 'Пациент',
    middleName: '',
    birthDate: '2022-04-12',
    sex: 'male',
    recordNumber: 'QA-001',
  };
  record.visit = {
    date: '2026-09-05',
    type: 'followup',
    clinician: ' Тестовый врач ',
    clinic: 'Тестовая клиника',
    specialty: 'Педиатр',
    diagnosis: 'Тестовая запись',
  };
  const saved = validateAssessment(record);
  assert.equal(saved.patient.lastName, 'Тестовый');
  assert.equal(saved.age, '4');
  assert.equal(saved.visit.clinician, 'Тестовый врач');
  const text = reportText(saved, true);
  for (const value of [
    'Тестовый Пациент',
    '2022-04-12',
    'Мужской',
    'QA-001',
    'Тестовая клиника',
    'Педиатр',
    'Повторный',
  ])
    assert.ok(text.includes(value));
});
test('invalid dates and impossible patient context are rejected', () => {
  const record = newAssessment();
  assert.throws(() =>
    validateAssessment({
      ...record,
      patient: { ...record.patient, birthDate: '2023-02-29' },
    }),
  );
  assert.throws(() =>
    validateAssessment({
      ...record,
      patient: { ...record.patient, birthDate: '2099-01-01' },
    }),
  );
  assert.throws(() =>
    validateAssessment({
      ...record,
      patient: { ...record.patient, birthDate: '2020-01-01' },
      visit: { ...record.visit, date: '2019-01-01' },
    }),
  );
  assert.throws(() =>
    validateAssessment({
      ...record,
      patient: { ...record.patient, sex: 'invalid' },
    }),
  );
  assert.throws(() =>
    validateAssessment({
      ...record,
      visit: { ...record.visit, type: 'invalid' },
    }),
  );
});
test('old saved drafts receive empty patient and visit defaults without losing answers', () => {
  const record: any = newAssessment();
  record.answers = { onset: selected('onset-infancy') };
  delete record.patient;
  delete record.visit;
  const upgraded = validateAssessment(record);
  assert.equal(upgraded.patient.lastName, '');
  assert.equal(upgraded.visit.type, 'initial');
  assert.equal(calculate(upgraded.answers).score, 8);
});

test('draft recovery retains other data when a date or age is not yet valid', () => {
  const record = newAssessment();
  record.patient.firstName = 'Пациент';
  record.patient.birthDate = '2099-01-01';
  record.answers = { family: selected('family-confirmed') };
  record.age = '-1';
  assert.throws(() => validateAssessment(record));
  const restored = validateAssessment(record, { recoverDraft: true });
  assert.equal(restored.patient.firstName, 'Пациент');
  assert.equal(restored.patient.birthDate, '2099-01-01');
  assert.equal(restored.age, '-1');
  assert.equal(calculate(restored.answers).score, 20);
});
