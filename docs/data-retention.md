# Data retention & backups policy (minors' PII)

SoCal Academy of Knowledge stores personal data about children. This policy states what we
keep, for how long, and how it is deleted. Owner: the Academy admin (board-designated).

## Backups (Supabase)
- Enable **automated daily backups** in the Supabase dashboard (Project → Database → Backups),
  or schedule `pg_dump` if on a plan without managed backups.
- Backups are encrypted at rest by Supabase. Restore is tested at least once per year.

## What we store & retention
| Data | Tables | Retention |
|---|---|---|
| Enrollment applications | `admission_applications` | Active applicants: duration of enrollment + 3 years. Declined/withdrawn: 1 year, then delete. |
| Enrolled student records | `students`, `student_contacts`, `enrollments`, `attendance` | While enrolled + 3 years after last enrollment (academic-record norm), then delete. |
| Fees / payments | `fees`, `fee_schedules`, `fee_payments` | 7 years (financial record requirement), then delete. |
| Volunteer applications | `volunteers` | While active + 1 year, then delete. |
| Staff applications | `staff_applications` | Hired: duration of employment + as required by law. Not hired: 1 year, then delete. |
| Contact inquiries | `contact_submissions` | 1 year, then delete. |
| Policy acknowledgements | `policy_acknowledgements` | While the relationship is active + 3 years. |
| Audit log | `audit_log` | 2 years, then delete (incident-investigation window). |
| Auth accounts | `auth.users`, `profiles` | Deactivate on departure; delete on request or after the related records expire. |

## Deletion on request
- A parent/guardian may request deletion of their child's data. Honor within 30 days **except**
  records we are legally required to keep (e.g. financial records within their retention window).
- Deletion removes rows from the tables above and the corresponding `auth.users` row. The
  `audit_log` retains a record that a deletion occurred (without re-storing the deleted PII).

## Access & safeguards
- Row-Level Security is the data boundary (see `docs/portal-subdomains.md` for the table list to
  verify). The `service_role` key is server-only.
- Portal sessions are isolated per subdomain; portals are `noindex`.
- All PII mutations are recorded in `audit_log` (see `audit_log_migration.sql`).

## Review
Review this policy annually and whenever the data model changes.
