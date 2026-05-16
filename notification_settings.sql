-- Create notification_settings table to store email reminder toggles and templates
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notification_settings" ON public.notification_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Seed the 3 fee reminder templates + invite templates
INSERT INTO public.notification_settings (key, label, description, enabled, subject, body) VALUES

('fee_monthly_reminder',
 'Monthly Fee Reminder (27th)',
 'Sent to ALL parents on the 27th of every month as a heads-up before billing.',
 false,
 'Upcoming Fee Payment – {{academy_name}}',
 'Dear {{parent_name}},

This is a friendly reminder from {{academy_name}} that your monthly tuition for {{student_name}} is due at the start of next month.

Program: {{program_name}}
Monthly Fee: ${{amount_due}}

Please log into your parent portal to view your balance and make a payment:
{{portal_url}}

JazakAllahu Khairan,
{{academy_name}} Administration'),

('fee_unpaid_1st_notice',
 '1st Unpaid Fee Notice (5th)',
 'Sent only to parents with an outstanding balance on the 5th of the month.',
 false,
 'Fee Payment Due – Action Required – {{academy_name}}',
 'Dear {{parent_name}},

We have not yet received your tuition payment for {{student_name}} for the current month.

Program: {{program_name}}
Amount Due: ${{amount_due}}

Please make your payment as soon as possible through the parent portal:
{{portal_url}}

If you have already made a payment or need to discuss a payment arrangement, please contact us immediately.

JazakAllahu Khairan,
{{academy_name}} Administration'),

('fee_unpaid_2nd_notice',
 '2nd Unpaid Fee Notice (10th)',
 'Second and final notice sent to parents still unpaid on the 10th of the month.',
 false,
 'URGENT: 2nd Notice – Fee Payment Overdue – {{academy_name}}',
 'Dear {{parent_name}},

This is a second and final notice regarding the overdue tuition payment for {{student_name}}.

Program: {{program_name}}
Amount Overdue: ${{amount_due}}

Your account is now past due. Please log into the parent portal immediately to settle your balance or contact us to arrange a payment plan:
{{portal_url}}

Continued non-payment may affect your child''s enrollment status. Please reach out to us as soon as possible.

JazakAllahu Khairan,
{{academy_name}} Administration'),

('teacher_invite',
 'Teacher Portal Invite',
 'Sent automatically when a new teacher is registered.',
 true,
 'Welcome to {{academy_name}} – Activate Your Teacher Account',
 'Dear {{teacher_name}},

You have been officially registered as a teacher at {{academy_name}}.

Please click the link below to set your password and activate your Teacher Portal account:
{{invite_url}}

Once logged in you will be able to view your class rosters, take attendance, and communicate with parents.

This link expires in 48 hours.

JazakAllahu Khairan,
{{academy_name}} Administration'),

('parent_registration',
 'Parent Registration Confirmation',
 'Sent automatically when a student is registered under a parent.',
 true,
 'Your Child Has Been Registered – {{academy_name}}',
 'Dear {{parent_name}},

We are pleased to confirm that {{student_name}} has been successfully registered at {{academy_name}}.

Registration Number: {{registration_number}}
Program: {{program_name}}

You can log into the Parent Portal to view attendance, fees, and progress updates at any time:
{{portal_url}}

If you have more than one child enrolled, you can manage all of them from the same portal account.

JazakAllahu Khairan,
{{academy_name}} Administration')

ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
