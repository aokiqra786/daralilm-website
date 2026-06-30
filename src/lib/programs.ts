// Single source of truth for program naming across all portals.
//
// Two parallel vocabularies exist in the data:
//   • program_type SLUG  — machine key on classes / fee_schedules (e.g. 'weekend_school')
//   • program label/interest STRING — human value on admission_applications.program_interest
//     and teachers.programs_qualified (e.g. 'Weekend School')
//
// The weekend program was historically keyed 'sunday_school' / labelled 'Sunday School';
// it is now uniformly "Weekend School". The helpers below also map the legacy values so any
// row not yet migrated still displays correctly.

export type ProgramType =
  | 'evening_quran'
  | 'weekend_school'
  | 'hifz'
  | 'vocational'
  | 'youth_activities'
  | 'adult_program'

// Dropdown options for selecting a class/fee program_type (slug + label).
export const PROGRAM_TYPE_OPTIONS: { value: ProgramType; label: string }[] = [
  { value: 'evening_quran',    label: "Evening Qur'an" },
  { value: 'weekend_school',   label: 'Weekend School' },
  { value: 'hifz',             label: 'Full-time Hifz' },
  { value: 'vocational',       label: 'Vocational' },
  { value: 'youth_activities', label: 'Youth Activities' },
  { value: 'adult_program',    label: 'Adult Program' },
]

export const PROGRAM_TYPE_LABELS: Record<string, string> = {
  evening_quran:    "Evening Qur'an",
  weekend_school:   'Weekend School',
  sunday_school:    'Weekend School', // legacy slug → new label
  hifz:             'Full-time Hifz',
  vocational:       'Vocational',
  youth_activities: 'Youth Activities',
  adult_program:    'Adult Program',
}

// Human-readable label for a program_type slug. Falls back to a title-cased
// version of the slug for any value not in the map.
export function programTypeLabel(slug?: string | null): string {
  if (!slug) return ''
  return (
    PROGRAM_TYPE_LABELS[slug] ??
    slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

// Human labels offered as "Program Interest" checkboxes during registration.
// These are stored verbatim (label == value) on admission_applications /
// teachers.programs_qualified.
export const PROGRAM_INTEREST_OPTIONS: string[] = [
  "Evening Qur'an",
  'Weekend School',
  'Full-time Hifz',
  'Vocational',
  'Youth Activities',
  'Adult Program',
]

// Display label for a stored program_interest string. Maps the legacy
// "Sunday School" value to "Weekend School"; returns the value otherwise.
export function programInterestLabel(value?: string | null): string {
  if (!value) return ''
  return value === 'Sunday School' ? 'Weekend School' : value
}

// Core academy classes that must never be deleted. Matched by name PREFIX so
// section suffixes like "Weekend School (Girls Saturday)" stay protected even
// though the exact class name varies. Legacy names kept for safety.
const PERMANENT_CLASS_PREFIXES = [
  'evening qur',     // Evening Qur'an (straight or smart apostrophe)
  'weekend school',  // Weekend School (Girls Saturday) / (Boys Sunday)
  'hifz',            // Hifz Full time School
  'hiz full',        // legacy typo
  'sunday school',   // legacy
  'saturday school', // legacy
]

export function isPermanentClass(name?: string | null): boolean {
  if (!name) return false
  const n = name.trim().toLowerCase()
  return PERMANENT_CLASS_PREFIXES.some((p) => n.startsWith(p))
}
