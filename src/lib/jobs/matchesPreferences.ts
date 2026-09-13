type JobForMatching = {
  location: string | null;
  seniority: string | null;
  industry: string | null;
  remote_type: string | null;
};

type PreferencesForMatching = {
  locations: string[] | null;
  seniority: string[] | null;
  industries: string[] | null;
  remote_preference: string | null;
} | null;

function includesLoose(list: string[] | null | undefined, value: string | null): boolean {
  if (!list || list.length === 0 || !value) return false;
  const normalized = value.toLowerCase();
  return list.some(
    (item) =>
      normalized.includes(item.toLowerCase()) || item.toLowerCase().includes(normalized),
  );
}

/**
 * Whether a job overlaps with the user's saved preferences on any of
 * location, seniority, industry, or remote type - loose/partial matching
 * since job data and preference text are both free-form. A user with no
 * preferences set matches everything (nothing to filter against yet).
 */
export function jobMatchesPreferences(
  job: JobForMatching,
  prefs: PreferencesForMatching,
): boolean {
  if (!prefs) return true;

  const hasAnyPreference =
    (prefs.locations && prefs.locations.length > 0) ||
    (prefs.seniority && prefs.seniority.length > 0) ||
    (prefs.industries && prefs.industries.length > 0) ||
    !!prefs.remote_preference;

  if (!hasAnyPreference) return true;

  const locationMatch = includesLoose(prefs.locations, job.location);
  const seniorityMatch = includesLoose(prefs.seniority, job.seniority);
  const industryMatch = includesLoose(prefs.industries, job.industry);
  const remoteMatch =
    !!prefs.remote_preference &&
    prefs.remote_preference !== "no_preference" &&
    job.remote_type === prefs.remote_preference;

  return locationMatch || seniorityMatch || industryMatch || remoteMatch;
}
