import type { SupabaseClient } from '@supabase/supabase-js'

// "Needs action" counts for the admin sidebar badges, keyed by the nav item's
// href. Each value is the number of items in that section awaiting admin action.
// Every query is resilient: a failure defaults that count to 0 so the sidebar
// never breaks. Filters are verified against each section's own page query.

const P = '/admin/dashboard'

export const SIDEBAR_COUNT_HREFS = {
  students:         `${P}/students`,
  classes:          `${P}/classes`,
  teachers:         `${P}/teachers`,
  volunteers:       `${P}/volunteers`,
  events:           `${P}/events`,
  staffApps:        `${P}/staff-applications`,
  fees:             `${P}/fees`,
  acknowledgements: `${P}/acknowledgements`,
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = SupabaseClient<any, any, any>

async function safeCount(fn: () => Promise<number>): Promise<number> {
  try {
    return await fn()
  } catch {
    return 0
  }
}

// Head-only exact count with a status/null filter applied via `build`.
async function headCount(
  supabase: DB,
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  build: (q: any) => any,
): Promise<number> {
  const { count, error } = await build(supabase.from(table).select('*', { count: 'exact', head: true }))
  if (error) throw error
  return count ?? 0
}

export async function getAdminSidebarCounts(supabase: DB): Promise<Record<string, number>> {
  const [
    students,
    classes,
    teachers,
    volunteers,
    events,
    staffApps,
    fees,
    acknowledgements,
  ] = await Promise.all([
    // Students: pending admission applications
    safeCount(() => headCount(supabase, 'admission_applications', (q) => q.eq('status', 'pending'))),
    // Classes & Programs: classes with no teacher assigned
    safeCount(() => headCount(supabase, 'classes', (q) => q.is('teacher_id', null))),
    // Teachers: onboarding incomplete (no portal account yet)
    safeCount(() => headCount(supabase, 'teachers', (q) => q.is('profile_id', null))),
    // Volunteers: pending applications
    safeCount(() => headCount(supabase, 'volunteers', (q) => q.eq('status', 'pending_approval'))),
    // Events: awaiting board/treasurer review
    safeCount(() => headCount(supabase, 'events', (q) => q.in('status', ['pending_board', 'changes_requested', 'pending_treasurer']))),
    // Staff Apps: pending staff applications
    safeCount(() => headCount(supabase, 'staff_applications', (q) => q.eq('status', 'pending'))),
    // Fee Management: DISTINCT students with an outstanding balance (no "overdue"
    // status exists — outstanding = not fully paid with a positive balance).
    safeCount(async () => {
      const { data, error } = await supabase
        .from('fee_records')
        .select('student_id')
        .neq('status', 'paid')
        .gt('balance_due', 0)
      if (error) throw error
      const ids = new Set((data ?? []).map((r: { student_id: string | null }) => r.student_id).filter(Boolean))
      return ids.size
    }),
    // Acknowledgements: unsigned policies (all roles)
    safeCount(() => headCount(supabase, 'policy_acknowledgements', (q) => q.is('acknowledged_at', null))),
  ])

  return {
    [SIDEBAR_COUNT_HREFS.students]:         students,
    [SIDEBAR_COUNT_HREFS.classes]:          classes,
    [SIDEBAR_COUNT_HREFS.teachers]:         teachers,
    [SIDEBAR_COUNT_HREFS.volunteers]:       volunteers,
    [SIDEBAR_COUNT_HREFS.events]:           events,
    [SIDEBAR_COUNT_HREFS.staffApps]:        staffApps,
    [SIDEBAR_COUNT_HREFS.fees]:             fees,
    [SIDEBAR_COUNT_HREFS.acknowledgements]: acknowledgements,
  }
}
