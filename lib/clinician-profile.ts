import type { Assessment } from './model';
import type { Visit } from './patient';

export const CLINICIAN_PROFILE_KEY = 'gencompass_clinician_profile';

export type ClinicianProfile = {
  name: string;
  specialty: string;
  organization: string;
};

type ProfileReader = Pick<Storage, 'getItem'>;
type ProfileWriter = Pick<Storage, 'setItem'>;
type ClinicianFields = Pick<Visit, 'clinician' | 'specialty' | 'clinic'>;

function parseProfile(value: unknown): ClinicianProfile | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const profile = value as Record<string, unknown>;
  const limits = { name: 160, specialty: 100, organization: 180 } as const;
  for (const [key, maximum] of Object.entries(limits)) {
    if (typeof profile[key] !== 'string' || profile[key].length > maximum)
      return null;
  }
  return {
    name: (profile.name as string).trim(),
    specialty: (profile.specialty as string).trim(),
    organization: (profile.organization as string).trim(),
  };
}

export function readClinicianProfile(
  storage?: ProfileReader | null,
): ClinicianProfile | null {
  try {
    const raw = storage?.getItem(CLINICIAN_PROFILE_KEY);
    if (!raw) return null;
    const profile = parseProfile(JSON.parse(raw));
    return profile && Object.values(profile).some(Boolean) ? profile : null;
  } catch {
    return null;
  }
}

/** Call only after the assessment was saved successfully. */
export function saveClinicianProfile(
  storage: ProfileWriter | null | undefined,
  visit: ClinicianFields,
): boolean {
  const profile = parseProfile({
    name: visit.clinician,
    specialty: visit.specialty,
    organization: visit.clinic,
  });
  if (!storage || !profile) return false;
  try {
    // Replace the entire profile, including cleared fields; never merge stale data.
    storage.setItem(CLINICIAN_PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    // Profile persistence is optional and must not invalidate a saved assessment.
    return false;
  }
}

/** Prefill new forms only; opening saved cases must not apply a current profile. */
export function applyClinicianProfile(
  record: Assessment,
  profile: ClinicianProfile | null,
): Assessment {
  if (!profile) return record;
  return {
    ...record,
    visit: {
      ...record.visit,
      clinician: record.visit.clinician || profile.name,
      specialty: record.visit.specialty || profile.specialty,
      clinic: record.visit.clinic || profile.organization,
    },
  };
}
