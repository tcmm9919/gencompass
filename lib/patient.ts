export type Patient = {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  sex: '' | 'female' | 'male' | 'unknown';
  recordNumber: string;
};
export type Visit = {
  date: string;
  type: 'initial' | 'followup';
  clinician: string;
  specialty: string;
  clinic: string;
  diagnosis: string;
};
export const emptyPatient: Patient = {
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  sex: '',
  recordNumber: '',
};
export const emptyVisit: Visit = {
  date: '',
  type: 'initial',
  clinician: '',
  specialty: '',
  clinic: '',
  diagnosis: '',
};
export const CLINICAL_TIME_ZONE = 'Asia/Almaty';
export function localDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINICAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return part('year') + '-' + part('month') + '-' + part('day');
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function ageAt(birthDate: string, date: string) {
  if (!validDate(birthDate) || !validDate(date) || birthDate > date)
    return null;
  const birth = new Date(birthDate + 'T00:00:00Z');
  const visit = new Date(date + 'T00:00:00Z');
  const months =
    (visit.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    visit.getUTCMonth() -
    birth.getUTCMonth() -
    (visit.getUTCDate() < birth.getUTCDate() ? 1 : 0);
  const days = Math.floor((visit.getTime() - birth.getTime()) / 86400000);
  return { years: Math.floor(months / 12), months, days };
}
function plural(value: number, one: string, few: string, many: string) {
  const mod100 = value % 100;
  const mod10 = value % 10;
  return mod100 >= 11 && mod100 <= 14
    ? many
    : mod10 === 1
      ? one
      : mod10 >= 2 && mod10 <= 4
        ? few
        : many;
}
export function ageMonthsLabel(months: number | null) {
  if (months === null || !Number.isInteger(months) || months < 0) return '—';
  const monthLabel = (value: number) =>
    `${value} ${plural(value, 'месяц', 'месяца', 'месяцев')}`;
  if (months < 36) return monthLabel(months);
  const years = Math.floor(months / 12);
  return `${years} ${plural(years, 'год', 'года', 'лет')} ${monthLabel(months % 12)}`;
}
export function ageLabel(birthDate: string, date: string) {
  return ageMonthsLabel(ageAt(birthDate, date)?.months ?? null);
}
export function patientName(patient: Patient) {
  return [patient.lastName, patient.firstName, patient.middleName]
    .filter(Boolean)
    .join(' ');
}
