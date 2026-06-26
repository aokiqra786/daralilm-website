'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Resend } from 'resend'

// Sender must be on the Resend-verified domain (socalaok.org).
const ADMISSIONS_FROM = 'SoCal Academy of Knowledge <admission@socalaok.org>'

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function submitAdmissionApplication(formData: FormData) {
  const supabase = await createClient()

  const parentFirstName = (formData.get('parentFirstName') as string)?.trim()
  const parentLastName  = (formData.get('parentLastName')  as string)?.trim()
  const parentEmail     = (formData.get('parentEmail')     as string)?.trim().toLowerCase()
  const parentPhone     = (formData.get('parentPhone')     as string)?.trim()
  const studentName     = (formData.get('studentName')     as string)?.trim()
  const dateOfBirth     = (formData.get('dateOfBirth')     as string)?.trim()
  const programInterest = (formData.get('programInterest') as string)?.trim()
  const notes           = (formData.get('notes')           as string)?.trim()

  const parentFullName = [parentFirstName, parentLastName].filter(Boolean).join(' ')

  const { error } = await supabase
    .from('admission_applications')
    .insert({
      student_name:     studentName,
      date_of_birth:    dateOfBirth || null,
      parent_name:      parentFullName,
      parent_email:     parentEmail,
      parent_phone:     parentPhone || null,
      program_interest: programInterest || null,
      notes:            notes || null,
      status:           'pending',
    })

  if (error) {
    console.error('Admission application error:', error.message)
    redirect('/admissions?error=failed')
  }

  // Notify staff + confirm to the applicant. Best-effort: the row is already
  // stored as the source of truth, so email failures are logged, not fatal.
  const resend = getResend()
  const notify = process.env.ADMISSIONS_NOTIFY_EMAIL || 'admission@socalaok.org'
  if (resend) {
    try {
      await resend.emails.send({
        from: ADMISSIONS_FROM,
        to: notify,
        replyTo: parentEmail || undefined,
        subject: `New enrollment application: ${studentName}`,
        text:
          `Student: ${studentName}\n` +
          `Date of birth: ${dateOfBirth || '—'}\n` +
          `Program of interest: ${programInterest || '—'}\n\n` +
          `Parent: ${parentFullName} <${parentEmail}> ${parentPhone || ''}\n\n` +
          `Notes: ${notes || '—'}`,
      })
    } catch (e) {
      console.error('Admission staff notification failed:', e)
    }

    if (parentEmail) {
      try {
        await resend.emails.send({
          from: ADMISSIONS_FROM,
          to: parentEmail,
          replyTo: notify,
          subject: 'We received your application — SoCal Academy of Knowledge',
          text:
            `Assalamu alaikum${parentFullName ? ` ${parentFullName}` : ''},\n\n` +
            `JazakAllahu Khairan for applying${programInterest ? ` for ${programInterest}` : ''}. ` +
            `We've received your application for ${studentName} and a staff member will contact you ` +
            `within 2 business days with the next steps.\n\n` +
            `If you have any questions, reply to this email or contact ${notify}.\n\n` +
            `— SoCal Academy of Knowledge`,
        })
      } catch (e) {
        console.error('Admission applicant confirmation failed:', e)
      }
    }
  } else {
    console.error('Admission: RESEND_API_KEY not set; no notification emails sent')
  }

  redirect('/admissions?success=submitted')
}
