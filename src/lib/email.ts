import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Helper to get Resend client
function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // During build time, this might be missing.
    // We only throw if we are actually trying to send an email.
    return null
  }
  return new Resend(apiKey)
}

async function getEmailTemplate(name: string, variables: Record<string, string>): Promise<{ subject: string, html: string } | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) return null

    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase.from('email_templates').select('subject, body_html').eq('name', name).single()
    
    if (error || !data) return null

    let html = data.body_html
    let subject = data.subject

    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value)
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    return { subject, html }
  } catch (err) {
    console.error('Failed to fetch email template:', err)
    return null
  }
}

// ─── Shared Policy Summary Block ─────────────────────────────────────────────
function policyBlock(role: 'teacher' | 'student' | 'volunteer' | 'admin') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const roleMap = {
    teacher:   { label: 'Teacher & Staff Policy Handbook',        url: `${siteUrl}/admin/teacher/policies`,    color: '#1e3a8a' },
    student:   { label: 'Student Code of Conduct & Policy',       url: `${siteUrl}/admin/parent/policies`,     color: '#047857' },
    volunteer: { label: 'Volunteer Code of Conduct & Guidelines', url: `${siteUrl}/admin/dashboard/policies`,  color: '#9333ea' },
    admin:     { label: 'Administrative Staff Policy Handbook',   url: `${siteUrl}/admin/dashboard/policies`,  color: '#1e3a8a' },
  }

  const { label, url, color } = roleMap[role]

  return `
    <div style="margin-top:32px; border-top:2px solid #e2e8f0; padding-top:24px;">
      <h3 style="color:#1e293b; font-size:16px; margin-bottom:8px;">📋 Please Review Our Policies</h3>
      <p style="color:#475569; font-size:14px; margin-bottom:16px;">
        As part of your onboarding with SoCal Academy of Knowledge, please take a moment to read and familiarise yourself with our
        <strong>${label}</strong>. By participating in our Academy, you agree to uphold these standards.
      </p>
      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <tr style="background:#f8fafc;">
          <td style="padding:12px 16px; border:1px solid #e2e8f0; border-radius:4px;">
            <strong style="color:${color};">${label}</strong><br/>
            <span style="color:#64748b; font-size:12px;">SoCal Academy of Knowledge — Academic Year 2025–2026</span>
          </td>
          <td style="padding:12px 16px; border:1px solid #e2e8f0; text-align:center; width:160px;">
            <a href="${url}" style="background-color:${color}; color:white; padding:8px 16px; text-decoration:none; border-radius:4px; font-size:13px; font-weight:bold;">
              View Policy →
            </a>
          </td>
        </tr>
      </table>
      <p style="color:#94a3b8; font-size:11px; margin-top:12px;">
        بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ — May Allah bless your journey with us. Ameen.
      </p>
    </div>
  `
}

export async function sendInviteEmail({
  email,
  token,
  role,
}: {
  email: string;
  token: string;
  role: 'teacher' | 'event_uploader' | 'parent' | 'admin';
}) {
  const portalName = role === 'teacher' ? 'Teacher Portal' : role === 'parent' ? 'Parent Portal' : role === 'admin' ? 'Admin Portal' : 'Event Uploader Portal';
  const onboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/onboard/${role.replace('_', '-')}?token=${token}`;

  let specificInstructions = '';
  if (role === 'teacher') {
    specificInstructions = `
      <h3>Next Steps: Setting up your account</h3>
      <ol>
        <li>Click the "Activate Account" button below.</li>
        <li>Create a secure password for your new account.</li>
        <li>Once logged in, you will be able to view your assigned classes, take attendance, and message parents directly from your dashboard.</li>
      </ol>
      <div style="background-color: #f8fafc; border-left: 4px solid #1e3a8a; padding: 15px; margin: 20px 0;">
        <strong>Need Help?</strong><br/>
        If you have questions about your class assignments or payroll details, please contact the administration directly. Your portal is your central hub for all teaching activities.
      </div>
    `;
  }

  let subject = `Welcome to SoCal Academy of Knowledge - ${portalName} Invite`
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
      </div>
      <h2 style="color: #1e3a8a;">Welcome to SoCal Academy of Knowledge!</h2>
      <p>You have been invited to join the <strong>${portalName}</strong>.</p>
      ${specificInstructions}
      <div style="text-align: center; margin: 30px 0;">
        <a href="${onboardUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          Set Up Your Account
        </a>
      </div>
      
      <p style="font-size: 12px; color: #666;">This link will expire in 48 hours. Please do not share this email.</p>
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:<br/>${onboardUrl}</p>

      ${role === 'teacher' ? policyBlock('teacher') : (role === 'event_uploader' ? policyBlock('volunteer') : '')}
    </div>
  `

  const template = await getEmailTemplate('staff_invite', {
    site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    portal_name: portalName,
    specific_instructions: specificInstructions,
    onboard_url: onboardUrl
  })

  if (template) {
    subject = template.subject
    html = template.html
  }

  try {
    const resend = getResend()
    if (!resend) throw new Error('Email service not configured (Missing API Key)')

    const { data, error } = await resend.emails.send({
      from: 'SoCal Academy of Knowledge Admin <admin@send.socalaok.org>',
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('Resend rejected invite email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export async function sendParentRegistrationEmail({
  email,
  parentName,
  studentName,
  regNumber,
}: {
  email: string;
  parentName: string;
  studentName: string;
  regNumber: string;
}) {
  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login/parent`;

  let subject = `Welcome to SoCal Academy of Knowledge!`
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
      </div>
      <h2 style="color: #1e3a8a;">Welcome to SoCal Academy of Knowledge!</h2>
      <p>Dear <strong>${parentName}</strong>,</p>
      <p>We are delighted to confirm the successful registration of <strong>${studentName}</strong>.</p>
      <p>Your Student Registration Number is: <strong style="font-size: 18px; color: #1e3a8a;">${regNumber}</strong></p>
      
      <div style="background-color: #f8fafc; border-left: 4px solid #1e3a8a; padding: 16px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #1e3a8a; font-size: 16px;">Next Step: Parent Portal Setup</h3>
        <p style="font-size: 14px; margin-bottom: 16px;">Please set up your Parent Portal account using the Registration Number above.</p>
        <a href="${portalUrl}" style="background-color: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Set Up Portal Account</a>
      </div>
      
      <p style="font-size: 12px; color: #666;">If you already have a Parent Portal account for an older sibling, simply log in. ${studentName} will be automatically added to your dashboard.</p>

      ${policyBlock('student')}
    </div>
  `

  const template = await getEmailTemplate('parent_welcome', {
    site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    parent_name: parentName,
    student_name: studentName,
    reg_number: regNumber,
    portal_url: portalUrl
  })

  if (template) {
    subject = template.subject
    html = template.html
  }

  try {
    const resend = getResend()
    if (!resend) throw new Error('Email service not configured (Missing API Key)')

    const { data, error } = await resend.emails.send({
      from: 'SoCal Academy of Knowledge Admin <admin@send.socalaok.org>',
      to: [email],
      subject,
      html,
    });

    if (error) {
      console.error('Resend rejected parent registration email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending parent registration email:', error);
    return { success: false, error };
  }
}

export async function sendWaitingListEmail({
  email,
  parentName,
  studentName,
  programInterest,
}: {
  email: string
  parentName: string
  studentName: string
  programInterest?: string | null
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const resend = getResend()
    if (!resend) throw new Error('Email service not configured (Missing API Key)')

    const { data, error } = await resend.emails.send({
      from: 'SoCal Academy of Knowledge <admin@send.socalaok.org>',
      to: [email],
      subject: `Application Received – ${studentName} | SoCal Academy of Knowledge`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="${siteUrl}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
          </div>

          <h2 style="color: #1e3a8a; font-size: 22px; margin-bottom: 4px;">JazakAllahu Khairan for Applying</h2>
          <p style="color: #475569; font-size: 14px; margin-top: 0;">SoCal Academy of Knowledge — Admissions</p>

          <p>Dear <strong>${parentName}</strong>,</p>

          <p>
            Thank you sincerely for submitting an application for <strong>${studentName}</strong>
            ${programInterest ? ` to the <strong>${programInterest}</strong> program` : ''}.
            We are truly grateful for your interest in our academy and your commitment to your child's Islamic education.
          </p>

          <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <strong style="color: #9a3412;">Important Notice</strong><br/>
            <p style="margin: 8px 0 0; color: #7c2d12;">
              Unfortunately, we do not have any available seats at this time.
              <strong>${studentName}'s application has been placed on our Waiting List</strong>
              and we will contact you as soon as a seat becomes available.
            </p>
          </div>

          <h3 style="color: #1e3a8a;">What happens next?</h3>
          <ul style="color: #475569; line-height: 1.8;">
            <li>Your child's application is <strong>saved and prioritized</strong> on our waiting list.</li>
            <li>We will reach out to you <strong>directly by phone or email</strong> the moment a seat opens up.</li>
            <li>You are welcome to <strong>check back with us in a couple of months</strong> if you have not heard from us.</li>
          </ul>

          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <strong style="color: #15803d;">Questions?</strong><br/>
            <p style="margin: 8px 0 0; color: #166534;">
              Please don't hesitate to reach out to our admissions team. We are happy to assist you.
            </p>
          </div>

          <p>
            May Allah bless you and your family, and we look forward to welcoming
            <strong>${studentName}</strong> to our community soon, insha'Allah.
          </p>

          <p style="margin-top: 32px;">
            Warm regards,<br/>
            <strong>Admissions Team</strong><br/>
            SoCal Academy of Knowledge
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 11px; color: #94a3b8; text-align: center;">
            SoCal Academy of Knowledge &nbsp;•&nbsp; Confidential &nbsp;•&nbsp;
            This email was sent to ${email}
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend rejected waiting list email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending waiting list email:', error)
    return { success: false, error }
  }
}

export async function sendDirectMessage({
  to,
  subject,
  message,
  replyTo,
  senderName
}: {
  to: string[]
  subject: string
  message: string
  replyTo?: string
  senderName?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const fromName = senderName ? `${senderName} via SoCal Academy` : 'SoCal Academy of Knowledge'
  
  try {
    const resend = getResend()
    if (!resend) throw new Error('Email service not configured (Missing API Key)')

    const { data, error } = await resend.emails.send({
      from: `${fromName} <admin@send.socalaok.org>`,
      to,
      replyTo: replyTo || 'admin@socalaok.org',
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
          <div style="margin-bottom: 24px;">
            <img src="${siteUrl}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 50px; object-fit: contain;" />
          </div>
          <p style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #334155;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">
            This message was sent securely via the SoCal Academy of Knowledge portal.
            ${replyTo ? 'You can reply directly to this email to respond to the sender.' : ''}
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend rejected direct message:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending direct message:', error)
    return { success: false, error }
  }
}

// ─── Volunteer Approval Email ─────────────────────────────────────────────────
export async function sendVolunteerApprovalEmail({
  email,
  fullName,
}: {
  email: string
  fullName: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  let subject = `Your Volunteer Application is Approved! Welcome to SoCal Academy of Knowledge`
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${siteUrl}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
      </div>
      
      <h2 style="color: #1e3a8a; font-size: 24px; margin-bottom: 20px;">Welcome to the Team, ${fullName}!</h2>
      
      <p>As-salamu alaykum,</p>
      
      <p>We are thrilled to inform you that your volunteer application for SoCal Academy of Knowledge has been <strong>approved!</strong></p>
      
      <p>JazakAllahu Khairan for stepping forward to dedicate your time and skills. Our community thrives because of dedicated individuals like you.</p>

      <p>
        Warm regards,<br/>
        <strong>Administration Team</strong><br/>
        SoCal Academy of Knowledge
      </p>

      ${policyBlock('volunteer')}

      <hr style="border:none; border-top:1px solid #e2e8f0; margin:32px 0;" />
    </div>
  `

  const template = await getEmailTemplate('volunteer_approval', {
    site_url: siteUrl,
    full_name: fullName
  })

  if (template) {
    subject = template.subject
    html = template.html
  }

  try {
    const resend = getResend()
    if (!resend) throw new Error('Email service not configured (Missing API Key)')

    const { data, error } = await resend.emails.send({
      from: 'SoCal Academy of Knowledge Admin <admin@send.socalaok.org>',
      to: [email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend rejected volunteer approval email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending volunteer approval email:', error)
    return { success: false, error }
  }
}

export async function sendAcknowledgementReminderEmail({
  email,
  name,
  role,
  token,
}: {
  email: string
  name: string
  role: 'student' | 'teacher' | 'volunteer' | 'event_uploader' | 'parent'
  token: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${siteUrl}/acknowledge?token=${token}`
  let subject = `Reminder: Action Required to Finalize Your Registration`
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${siteUrl}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
      </div>
      <h2 style="color: #ea580c;">Registration Pending: Signature Required</h2>
      <p>As-salamu alaykum <strong>${name}</strong>,</p>
      <p>This is a gentle reminder that your registration with SoCal Academy of Knowledge is currently <strong>pending your signature</strong> on our policies and disclaimer.</p>
      <p>Please take a moment to review the documents and digitally sign them to finalize your access.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Review and Sign Now →
        </a>
      </div>
      
      <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser:<br/>${url}</p>
    </div>
  `

  const template = await getEmailTemplate('acknowledgement_reminder', {
    site_url: siteUrl,
    name: name,
    url: url
  })

  if (template) {
    subject = template.subject
    html = template.html
  }

  try {
    const resend = getResend()
    if (!resend) throw new Error('Email service not configured (Missing API Key)')

    const { data, error } = await resend.emails.send({
      from: 'SoCal Academy of Knowledge Admin <admin@send.socalaok.org>',
      to: [email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend rejected reminder email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending reminder email:', error)
    return { success: false, error }
  }
}

export async function sendSignatureRequestEmail({
  email,
  name,
  role,
  token,
}: {
  email: string
  name: string
  role: 'student' | 'teacher' | 'volunteer' | 'event_uploader' | 'parent' | 'admin'
  token: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const url = `${siteUrl}/acknowledge?token=${token}`

  let subject = `Action Required: Please Sign Academy Policies`
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${siteUrl}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height: 60px; object-fit: contain;" />
      </div>
      <h2 style="color: #ea580c; text-align: center;">Action Required: Signature Needed</h2>
      <p>As-salamu alaykum <strong>${name}</strong>,</p>
      <p>Your registration with SoCal Academy of Knowledge is currently pending. Before we can finalize your account and send your portal access, you must review and digitally sign the Academy's Code of Conduct and Legal Disclaimer.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${url}" style="background-color: #ea580c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Review & Sign Policies →
        </a>
      </div>
      
      <p style="font-size: 12px; color: #64748b;">If the button doesn't work, copy and paste this link into your browser:<br/>${url}</p>
      
      <p style="margin-top: 32px;">
        JazakAllahu Khairan,<br/>
        <strong>Administration Team</strong><br/>
        SoCal Academy of Knowledge
      </p>
    </div>
  `

  const template = await getEmailTemplate('signature_request', {
    site_url: siteUrl,
    name: name,
    url: url
  })

  if (template) {
    subject = template.subject
    html = template.html
  }

  try {
    const resend = getResend()
    if (!resend) throw new Error('Email service not configured (Missing API Key)')

    const { data, error } = await resend.emails.send({
      from: 'SoCal Academy of Knowledge Admin <admin@send.socalaok.org>',
      to: [email],
      subject,
      html,
    })

    if (error) {
      console.error('Resend rejected signature request email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending signature request email:', error)
    return { success: false, error }
  }
}

// ─── Event workflow emails ───────────────────────────────────────────────────
const EVENT_FROM = 'SoCal Academy of Knowledge Admin <admin@send.socalaok.org>'

function wrapEmail(bodyHtml: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
    <div style="text-align:center;margin-bottom:24px;"><img src="${siteUrl}/brand/logo/AoK_Logo_Color_transparent.png" alt="SoCal Academy of Knowledge" style="height:56px;object-fit:contain;" /></div>
    ${bodyHtml}
    <p style="margin-top:32px;color:#64748b;font-size:12px;">SoCal Academy of Knowledge</p>
  </div>`
}

function emailBtn(href: string, label: string, bg = '#005418', color = '#ffffff') {
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${color};padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:bold;">${label}</a>`
}

async function sendBasicEmail(to: string[], subject: string, bodyHtml: string) {
  const recipients = Array.from(new Set(to.filter(Boolean)))
  if (!recipients.length) return { success: false as const, error: 'no recipients' }
  try {
    const resend = getResend()
    if (!resend) throw new Error('Email service not configured (Missing API Key)')
    const { data, error } = await resend.emails.send({
      from: EVENT_FROM,
      to: recipients,
      subject,
      html: wrapEmail(bodyHtml),
    })
    if (error) {
      console.error('Resend rejected event email:', error)
      return { success: false as const, error }
    }
    return { success: true as const, data }
  } catch (error) {
    console.error('Error sending event email:', error)
    return { success: false as const, error }
  }
}

export async function sendEventSubmittedEmail(o: { to: string[]; eventTitle: string; link: string }) {
  return sendBasicEmail(o.to, `Event proposal needs board review: ${o.eventTitle}`,
    `<h2 style="color:#005418;">New event proposal</h2><p><strong>${o.eventTitle}</strong> has been submitted and needs board review.</p><p style="margin:24px 0;">${emailBtn(o.link, 'Review proposal')}</p>`)
}

export async function sendEventChangesRequestedEmail(o: { to: string[]; eventTitle: string; note?: string | null; link: string }) {
  return sendBasicEmail(o.to, `Changes requested: ${o.eventTitle}`,
    `<h2 style="color:#005418;">Changes requested</h2><p>Your event <strong>${o.eventTitle}</strong> needs changes before it can proceed.</p>${o.note ? `<p style="background:#f6f1e4;padding:12px;border-radius:6px;">&ldquo;${o.note}&rdquo;</p>` : ''}<p style="margin:24px 0;">${emailBtn(o.link, 'Open proposal')}</p>`)
}

export async function sendEventTreasurerNeededEmail(o: { to: string[]; eventTitle: string; link: string }) {
  return sendBasicEmail(o.to, `Funds approval needed: ${o.eventTitle}`,
    `<h2 style="color:#005418;">Treasurer approval needed</h2><p>The board confirmed the budget for <strong>${o.eventTitle}</strong>. It now needs your funds-availability decision.</p><p style="margin:24px 0;">${emailBtn(o.link, 'Review & approve funds')}</p>`)
}

export async function sendEventApprovedEmail(o: { to: string[]; eventTitle: string; link: string }) {
  return sendBasicEmail(o.to, `Funds approved: ${o.eventTitle}`,
    `<h2 style="color:#005418;">Funds approved</h2><p><strong>${o.eventTitle}</strong> has been approved by the treasurer and is ready to publish.</p><p style="margin:24px 0;">${emailBtn(o.link, 'Open event')}</p>`)
}

// RSVP invite — BUDGET-FREE by design (no fee / expenses / net anywhere).
export async function sendEventRsvpInviteEmail(o: { email: string; name?: string | null; eventTitle: string; whenText: string; location: string; roleText?: string | null; link: string }) {
  return sendBasicEmail([o.email], `Please confirm your availability: ${o.eventTitle}`,
    `<h2 style="color:#005418;">You&apos;re invited to help at an event</h2>
     <p>As-salamu alaykum${o.name ? ` ${o.name}` : ''},</p>
     <p>Please confirm whether you&apos;re available for:</p>
     <table style="margin:12px 0;font-size:15px;">
       <tr><td style="color:#64748b;padding:2px 12px 2px 0;">Event</td><td><strong>${o.eventTitle}</strong></td></tr>
       <tr><td style="color:#64748b;padding:2px 12px 2px 0;">When</td><td>${o.whenText}</td></tr>
       <tr><td style="color:#64748b;padding:2px 12px 2px 0;">Where</td><td>${o.location}</td></tr>
       ${o.roleText ? `<tr><td style="color:#64748b;padding:2px 12px 2px 0;">Your role</td><td>${o.roleText}</td></tr>` : ''}
     </table>
     <p style="margin:24px 0;">${emailBtn(o.link, 'Respond (Accept / Decline)')}</p>`)
}

export async function sendEventRsvpReminderEmail(o: { email: string; name?: string | null; eventTitle: string; whenText: string; location: string; link: string }) {
  return sendBasicEmail([o.email], `Reminder — please confirm availability: ${o.eventTitle}`,
    `<h2 style="color:#005418;">Quick reminder</h2><p>We haven&apos;t heard from you about <strong>${o.eventTitle}</strong> (${o.whenText}, ${o.location}). Please let us know if you can help.</p><p style="margin:24px 0;">${emailBtn(o.link, 'Respond now')}</p>`)
}

export async function sendRequiredDeclineAlert(o: { to: string[]; eventTitle: string; who: string; link: string }) {
  return sendBasicEmail(o.to, `Coverage needed: ${o.who} declined ${o.eventTitle}`,
    `<h2 style="color:#b03a2e;">Coverage needed</h2><p><strong>${o.who}</strong> declined the RSVP for <strong>${o.eventTitle}</strong>. You may need to arrange a substitute.</p><p style="margin:24px 0;">${emailBtn(o.link, 'Open event')}</p>`)
}
