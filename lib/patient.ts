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
export function ageAt(birthDate: string, date = localDate()) {
  if (!validDate(birthDate) || !validDate(date) || birthDate > date)
    return null;
  const birth = new Date(birthDate + 'T00:00:00Z');
  const visit = new Date(date + 'T00:00:00Z');
  let years = visit.getUTCFullYear() - birth.getUTCFullYear();
  if (
    visit.getUTCMonth() < birth.getUTCMonth() ||
    (visit.getUTCMonth() === birth.getUTCMonth() &&
      visit.getUTCDate() < birth.getUTCDate())
  )
    years--;
  const months =
    (visit.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    visit.getUTCMonth() -
    birth.getUTCMonth() -
    (visit.getUTCDate() < birth.getUTCDate() ? 1 : 0);
  const days = Math.floor((visit.getTime() - birth.getTime()) / 86400000);
  return { years, months, days };
}
export function ageLabel(birthDate: string, date = localDate()) {
  const age = ageAt(birthDate, date);
  if (!age) return '—';
  if (age.months < 1) return age.days + ' дн.';
  if (age.years < 2) return age.months + ' мес.';
  return age.years + ' лет';
}
export function patientName(patient: Patient) {
  return [patient.lastName, patient.firstName, patient.middleName]
    .filter(Boolean)
    .join(' ');
}
