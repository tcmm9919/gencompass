import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyClinicianProfile,
  CLINICIAN_PROFILE_KEY,
  readClinicianProfile,
  saveClinicianProfile,
} from '../lib/clinician-profile';
import { newAssessment } from '../lib/model';

function memoryStorage() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
}

test('clinician profile prefills new assessments without changing patient or visit context', () => {
  const storage = memoryStorage();
  const previous = newAssessment();
  previous.visit = {
    ...previous.visit,
    clinician: '  Доктор Тестов  ',
    specialty: 'Педиатр',
    clinic: 'Учебная клиника',
  };
  assert.equal(saveClinicianProfile(storage, previous.visit), true);
  const fresh = newAssessment();
  fresh.patient.lastName = 'Пациент';
  fresh.visit.diagnosis = 'Причина оценки';
  const next = applyClinicianProfile(fresh, readClinicianProfile(storage));
  assert.equal(next.visit.clinician, 'Доктор Тестов');
  assert.equal(next.visit.specialty, 'Педиатр');
  assert.equal(next.visit.clinic, 'Учебная клиника');
  assert.equal(next.visit.date, fresh.visit.date);
  assert.equal(next.visit.type, fresh.visit.type);
  assert.equal(next.visit.diagnosis, 'Причина оценки');
  assert.deepEqual(next.patient, fresh.patient);
  assert.equal(fresh.visit.clinician, '');
  assert.deepEqual(JSON.parse(storage.getItem(CLINICIAN_PROFILE_KEY)!), {
    name: 'Доктор Тестов',
    specialty: 'Педиатр',
    organization: 'Учебная клиника',
  });
});

test('profile updates replace cleared fields and an entirely cleared profile stays empty', () => {
  const storage = memoryStorage();
  saveClinicianProfile(storage, {
    clinician: 'Первый врач',
    specialty: 'Генетик',
    clinic: 'Клиника',
  });
  saveClinicianProfile(storage, {
    clinician: 'Другой врач',
    specialty: '',
    clinic: '',
  });
  assert.deepEqual(readClinicianProfile(storage), {
    name: 'Другой врач',
    specialty: '',
    organization: '',
  });
  saveClinicianProfile(storage, { clinician: '', specialty: '', clinic: '' });
  assert.equal(readClinicianProfile(storage), null);
});

test('corrupt, oversized or unavailable profile storage does not break assessments', () => {
  const storage = memoryStorage();
  for (const raw of [
    '{',
    'null',
    '[]',
    '{}',
    JSON.stringify({ name: 123, specialty: '', organization: '' }),
    JSON.stringify({ name: 'a'.repeat(161), specialty: '', organization: '' }),
    JSON.stringify({ name: '', specialty: 'a'.repeat(101), organization: '' }),
    JSON.stringify({ name: '', specialty: '', organization: 'a'.repeat(181) }),
  ]) {
    storage.setItem(CLINICIAN_PROFILE_KEY, raw);
    assert.equal(readClinicianProfile(storage), null);
  }
  assert.equal(readClinicianProfile(), null);
  const blocked = {
    getItem() {
      throw new Error('Storage unavailable');
    },
    setItem() {
      throw new Error('Storage unavailable');
    },
  };
  assert.equal(readClinicianProfile(blocked), null);
  assert.equal(saveClinicianProfile(blocked, newAssessment().visit), false);
  assert.equal(saveClinicianProfile(undefined, newAssessment().visit), false);
  assert.equal(
    saveClinicianProfile(storage, {
      clinician: 'a'.repeat(161),
      specialty: '',
      clinic: '',
    }),
    false,
  );
});

test('prefill preserves already-entered clinician fields and does not mutate the profile', () => {
  const record = newAssessment();
  record.visit.clinician = 'Врач текущего приёма';
  const profile = {
    name: 'Врач из профиля',
    specialty: 'Педиатр',
    organization: 'Клиника',
  };
  const next = applyClinicianProfile(record, profile);
  assert.equal(next.visit.clinician, 'Врач текущего приёма');
  assert.equal(next.visit.specialty, 'Педиатр');
  assert.equal(profile.name, 'Врач из профиля');
  assert.equal(applyClinicianProfile(record, null), record);
});
