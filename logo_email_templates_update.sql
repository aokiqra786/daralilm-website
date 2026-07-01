-- ============================================================
-- Repoint email-template logos to the finalized brand emblem
-- ============================================================
-- getEmailTemplate() (src/lib/email.ts) overrides the hardcoded email HTML with
-- a DB `email_templates` row when one exists. Any seeded row still points the
-- logo at /new_logo.png, so update it to the brand logo. Safe no-op if the table
-- is empty / has no such rows. Idempotent.
-- ============================================================

UPDATE public.email_templates
SET body_html = replace(body_html, '/new_logo.png', '/brand/logo/AoK_Logo_Color_transparent.png')
WHERE body_html LIKE '%/new_logo.png%';
