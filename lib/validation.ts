import {
  emptyPatient,
  emptyVisit,
  localDate,
  validDate,
  ageAt,
  type Patient,
  type Visit,
} from './patient';
import { categories, calculate, type Assessment, type Answers } from './model';
export function validateAssessment(
  value: unknown,
  { recoverDraft = false }: { recoverDraft?: boolean } = {},
): Assessment {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Некорректная оценка.');
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v.id,
    )
  )
    throw new Error('Некорректный идентификатор.');
  if (typeof v.code !== 'string' || v.code.length > 40)
    throw new Error('Код случая: максимум 40 символов.');
  if (
    typeof v.age !== 'string' ||
    v.age.length > 12 ||
    (!recoverDraft &&
      v.age !== '' &&
      (!/^\d{1,3}$/.test(v.age) || Number(v.age) > 120))
  )
    throw new Error('Возраст должен быть целым числом от 0 до 120 лет.');
  if (typeof v.notes !== 'string' || v.notes.length > 2000)
    throw new Error('Примечание: максимум 2000 символов.');
  if (v.status !== 'draft' && v.status !== 'complete')
    throw new Error('Некорректный статус.');
  if (v.modelVersion !== 'demo-0.1')
    throw new Error('Версия модели не поддерживается.');
  if (!v.answers || typeof v.answers !== 'object' || Array.isArray(v.answers))
    throw new Error('Некорректные ответы.');
  const answers: Answers = {};
  for (const [key, raw] of Object.entries(v.answers)) {
    const cat = categories.find((c) => c.id === key);
    if (!cat || !raw || typeof raw !== 'object' || Array.isArray(raw))
      throw new Error('Неизвестная категория.');
    const a = raw as Record<string, unknown>;
    if (
      !['selected', 'none', 'unknown'].includes(String(a.status)) ||
      !Array.isArray(a.selected)
    )
      throw new Error('Некорректный ответ.');
    const selected = a.selected;
    if (
      selected.some(
        (id) =>
          typeof id !== 'string' || !cat.criteria.some((c) => c.id === id),
      ) ||
      new Set(selected).size !== selected.length
    )
      throw new Error('Неизвестный или повторяющийся критерий.');
    if (
      a.status === 'selected' &&
      (!selected.length || (cat.mode === 'single' && selected.length !== 1))
    )
      throw new Error('Проверьте число выбранных вариантов.');
    if (a.status !== 'selected' && selected.length)
      throw new Error(
        'Неизвестный или отрицательный ответ не может содержать признаки.',
      );
    answers[key] = {
      status: a.status as 'selected' | 'none' | 'unknown',
      selected: selected as string[],
    };
  }
  const patient = readFields(v.patient, emptyPatient, {
    lastName: 80,
    firstName: 80,
    middleName: 80,
    birthDate: 10,
    sex: 10,
    recordNumber: 60,
  }) as Patient;
  const visit = readFields(v.visit, emptyVisit, {
    date: 10,
    type: 10,
    clinician: 160,
    specialty: 100,
    clinic: 180,
    diagnosis: 500,
  }) as Visit;
  if (!['', 'female', 'male', 'unknown'].includes(patient.sex))
    throw new Error('Проверьте пол пациента.');
  if (!['initial', 'followup'].includes(visit.type))
    throw new Error('Проверьте тип приёма.');
  if (
    !recoverDraft &&
    visit.date &&
    (!validDate(visit.date) || visit.date > localDate())
  )
    throw new Error('Укажите корректную дату оценки, не позднее сегодняшней.');
  if (
    !recoverDraft &&
    patient.birthDate &&
    (!validDate(patient.birthDate) ||
      patient.birthDate > (visit.date || localDate()))
  )
    throw new Error('Дата рождения должна быть не позднее даты оценки.');
  const computedAge = patient.birthDate
    ? ageAt(patient.birthDate, visit.date || localDate())
    : null;
  if (!recoverDraft && computedAge && computedAge.years > 120)
    throw new Error('Возраст пациента не может превышать 120 лет.');
  if (!recoverDraft && v.status === 'complete' && !calculate(answers).hasData)
    throw new Error(
      'Для результата нужна хотя бы одна категория с известными данными.',
    );
  return {
    id: v.id,
    code: v.code.trim(),
    age: computedAge ? String(computedAge.years) : v.age,
    patient,
    visit,
    notes: v.notes.trim(),
    answers,
    status: v.status,
    updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : '',
    modelVersion: 'demo-0.1',
  };
}

function readFields(
  value: unknown,
  defaults: Record<string, string>,
  limits: Record<string, number>,
): Record<string, string> {
  if (value === undefined) return { ...defaults };
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Некорректные данные пациента или приёма.');
  const out = { ...defaults };
  for (const [key, limit] of Object.entries(limits)) {
    const field = (value as Record<string, unknown>)[key] ?? defaults[key];
    if (typeof field !== 'string' || field.length > limit)
      throw new Error(
        'Проверьте поле ' + key + '. Максимум ' + limit + ' символов.',
      );
    out[key] = field.trim();
  }
  return out;
}
