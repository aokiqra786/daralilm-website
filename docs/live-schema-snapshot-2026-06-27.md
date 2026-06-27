# Live Supabase schema snapshot — 2026-06-27

Captured from the PostgREST OpenAPI definition (read-only) for project
`issyhmceqfzedfmvxiqa`, because these tables have **no `CREATE TABLE` migration
in the repo** (created ad-hoc in prod). Source of truth for the Tier 1 RLS work.

Two corrections vs. the repo-based plan:
- **`fee_adjustments` EXISTS in prod** (the repo has no migration for it). Do NOT
  rebuild it — query it.
- **`messages` does NOT exist.** Messages are email-only (Resend), not stored.
  It drops out of RLS scope.

## Tables + columns (FK noted)

**profiles**: id(uuid) · email(text) · role(text) · created_at(timestamptz) · full_name(text)

**parent_students**: parent_id(uuid→profiles.id) · student_id(uuid→students.id)

**students**: id · full_name · registration_number · parent_email · enrolled_program · is_active · status · date_of_birth · gender · enrollment_date · parent_name · parent_phone · emergency_contact_* · medical_notes · photo_url · admin_notes · student_phone · student_email

**classes**: id · name · program_type · teacher_id(uuid→profiles.id) · schedule_days(text[]) · schedule_time · attendance_type · gender_requirement

**class_enrollments**: id · class_id(→classes.id) · student_id(→students.id) · enrolled_at

**fee_records**: id · student_id(→students.id) · class_id(→classes.id) · fee_schedule_id(→fee_schedules.id) · billing_period(date) · base_amount(num) · discount_amount(num) · net_amount(num) · amount_paid(num) · balance_due(num) · payment_method · paid_date(date) · status(text) · notes · recorded_by(→profiles.id) · fee_type · remarks

**fee_schedules**: id · program_type · label · amount(num) · frequency · sibling_2_discount_pct(int) · sibling_3_discount_pct(int) · is_active(bool) · fee_type · remarks

**grades**: id · assessment_id(→assessments.id) · student_id(→students.id) · grade(text) · notes · recorded_by(→profiles.id) · created_at

**assessments**: id · class_id(→classes.id) · name · assessment_type · assessment_date(date)

**attendance_records**: id · class_id(→classes.id) · student_id(→students.id) · session_date(date) · status · notes · recorded_by(→profiles.id)

**fee_adjustments** (EXISTS): id · student_id(→students.id) · adjustment_type(text) · discount_pct(int) · discount_flat(num) · reason · approved_by(→profiles.id) · valid_from(date) · valid_until(date) · created_at

## Scoping paths confirmed for RLS
- parent → own children: `parent_students.parent_id = auth.uid()` → `student_id`
- teacher → own classes: `classes.teacher_id = auth.uid()` → `classes.id`
- teacher → students in own classes: `class_enrollments.class_id ∈ teacher classes` → `student_id`
- grade → class: `grades.assessment_id` → `assessments.class_id`

## Not determinable from REST (need SQL editor — see preflight)
- Current RLS enabled/disabled state per table
- Existing policies/grants (PostgREST can't read pg_catalog)
- Empirical anon read returned 0 rows / 401 — inconclusive (tests `anon`, not `authenticated`)
