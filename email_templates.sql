-- Create email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    required_variables JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for public reading (server-side will use this)
CREATE POLICY "Enable read access for all users" ON public.email_templates
    FOR SELECT USING (true);

-- Create policy for admin updates
CREATE POLICY "Enable update for admins" ON public.email_templates
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin'))
    );

CREATE POLICY "Enable insert for admins" ON public.email_templates
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'super_admin'))
    );

-- Seed Initial Templates
-- 1. Signature Request
INSERT INTO public.email_templates (name, display_name, subject, body_html, required_variables)
VALUES (
    'signature_request',
    'Policy Signature Request',
    'Action Required: Please Sign Academy Policies',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="{{site_url}}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
  </div>
  <h2 style="color: #ea580c; text-align: center;">Action Required: Signature Needed</h2>
  <p>As-salamu alaykum <strong>{{name}}</strong>,</p>
  <p>Your registration with SoCal Academy of Knowledge is currently pending. Before we can finalize your account and send your portal access, you must review and digitally sign the Academy''s Code of Conduct and Legal Disclaimer.</p>
  
  <div style="text-align: center; margin: 32px 0;">
    <a href="{{url}}" style="background-color: #ea580c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
      Review & Sign Policies →
    </a>
  </div>
  
  <p style="font-size: 12px; color: #64748b;">If the button doesn''t work, copy and paste this link into your browser:<br/>{{url}}</p>
  
  <p style="margin-top: 32px;">
    JazakAllahu Khairan,<br/>
    <strong>Administration Team</strong><br/>
    SoCal Academy of Knowledge
  </p>
</div>',
    '["{{site_url}}", "{{name}}", "{{url}}"]'
) ON CONFLICT (name) DO NOTHING;

-- 2. Parent Welcome
INSERT INTO public.email_templates (name, display_name, subject, body_html, required_variables)
VALUES (
    'parent_welcome',
    'Parent Registration Welcome',
    'Welcome to SoCal Academy of Knowledge!',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="{{site_url}}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
  </div>
  <h2 style="color: #1e3a8a;">Welcome to SoCal Academy of Knowledge!</h2>
  <p>Dear <strong>{{parent_name}}</strong>,</p>
  <p>We are delighted to confirm the successful registration of <strong>{{student_name}}</strong>.</p>
  <p>Your Student Registration Number is: <strong style="font-size: 18px; color: #1e3a8a;">{{reg_number}}</strong></p>
  
  <div style="background-color: #f8fafc; border-left: 4px solid #1e3a8a; padding: 16px; margin: 24px 0;">
    <h3 style="margin-top: 0; color: #1e3a8a; font-size: 16px;">Next Step: Parent Portal Setup</h3>
    <p style="font-size: 14px; margin-bottom: 16px;">Please set up your Parent Portal account using the Registration Number above.</p>
    <a href="{{portal_url}}" style="background-color: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Set Up Portal Account</a>
  </div>
  
  <p style="font-size: 12px; color: #666;">If you already have a Parent Portal account for an older sibling, simply log in. {{student_name}} will be automatically added to your dashboard.</p>
</div>',
    '["{{site_url}}", "{{parent_name}}", "{{student_name}}", "{{reg_number}}", "{{portal_url}}"]'
) ON CONFLICT (name) DO NOTHING;

-- 3. Staff Invite
INSERT INTO public.email_templates (name, display_name, subject, body_html, required_variables)
VALUES (
    'staff_invite',
    'Staff / Teacher Portal Invite',
    'Setup Your {{portal_name}} Account',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="{{site_url}}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
  </div>
  <h2 style="color: #1e3a8a;">Welcome to SoCal Academy of Knowledge!</h2>
  <p>You have been invited to join the <strong>{{portal_name}}</strong>.</p>
  {{specific_instructions}}
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{onboard_url}}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
      Set Up Your Account
    </a>
  </div>
  
  <p style="font-size: 12px; color: #666;">This link will expire in 48 hours. Please do not share this email.</p>
  <p style="font-size: 12px; color: #666;">If the button doesn''t work, copy and paste this link into your browser:<br/>{{onboard_url}}</p>
</div>',
    '["{{site_url}}", "{{portal_name}}", "{{specific_instructions}}", "{{onboard_url}}"]'
) ON CONFLICT (name) DO NOTHING;

-- 4. Volunteer Approval
INSERT INTO public.email_templates (name, display_name, subject, body_html, required_variables)
VALUES (
    'volunteer_approval',
    'Volunteer Approval Welcome',
    'Your Volunteer Application is Approved! Welcome to SoCal Academy of Knowledge',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="{{site_url}}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
  </div>
  
  <h2 style="color: #1e3a8a; font-size: 24px; margin-bottom: 20px;">Welcome to the Team, {{full_name}}!</h2>
  
  <p>As-salamu alaykum,</p>
  
  <p>We are thrilled to inform you that your volunteer application for SoCal Academy of Knowledge has been <strong>approved!</strong></p>
  
  <p>JazakAllahu Khairan for stepping forward to dedicate your time and skills. Our community thrives because of dedicated individuals like you.</p>

  <p>
    Warm regards,<br/>
    <strong>Administration Team</strong><br/>
    SoCal Academy of Knowledge
  </p>
</div>',
    '["{{site_url}}", "{{full_name}}"]'
) ON CONFLICT (name) DO NOTHING;

-- 5. Acknowledgement Reminder
INSERT INTO public.email_templates (name, display_name, subject, body_html, required_variables)
VALUES (
    'acknowledgement_reminder',
    'Signature Reminder',
    'Reminder: Action Required to Finalize Your Registration',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="{{site_url}}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
  </div>
  <h2 style="color: #ea580c;">Registration Pending: Signature Required</h2>
  <p>As-salamu alaykum <strong>{{name}}</strong>,</p>
  <p>This is a gentle reminder that your registration with SoCal Academy of Knowledge is currently <strong>pending your signature</strong> on our policies and disclaimer.</p>
  <p>Please take a moment to review the documents and digitally sign them to finalize your access.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{url}}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
      Review and Sign Now →
    </a>
  </div>
  
  <p style="font-size: 12px; color: #666;">If the button doesn''t work, copy and paste this link into your browser:<br/>{{url}}</p>
</div>',
    '["{{site_url}}", "{{name}}", "{{url}}"]'
) ON CONFLICT (name) DO NOTHING;
