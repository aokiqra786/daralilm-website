'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { Resend } from 'resend'
import { HONEYPOT_FIELD, honeypotTripped, rateLimit, clientIp } from '@/lib/security'

// Sender must be on the Resend-verified domain (socalaok.org).
const ADMISSIONS_FROM = 'SoCal Academy of Knowledge <admission@socalaok.org>'

// Optional document uploads -> private bucket, written server-side via the
// service-role client (the bucket has no anon policy, so it stays fully private).
const DOC_BUCKET = 'admissions-docs'
const ALLOWED_DOC_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'])
const MAX_DOC_BYTES = 5 * 1024 * 1024 // 5 MB each
const MAX_DOCS = 5

const AdmissionSchema = z.object({
  studentName: z.string().trim().min(1).max(200),
  parentEmail: z.string().trim().email().max(254),
  parentName: z.string().trim().max(200).optional(),
  parentPhone: z.string().trim().max(50).optional(),
  dateOfBirth: z.string().trim().max(40).optional(),
  programInterest: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(5000).optional(),
})

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function submitAdmissionApplication(formData: FormData) {
  const h = await headers()
  if (!rateLimit(`admission:${clientIp(h)}`, 5)) {
    redirect('/admissions?error=failed')
  }
  // Honeypot: pretend success so bots don't retry.
  if (honeypotTripped(formData.get(HONEYPOT_FIELD))) {
    redirect('/admissions?success=submitted')
  }

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

  const valid = AdmissionSchema.safeParse({
    studentName, parentEmail, parentName: parentFullName, parentPhone, dateOfBirth, programInterest, notes,
  })
  if (!valid.success) {
    redirect('/admissions?error=failed')
  }

  // Optional documents: validate + upload to the private bucket via service-role.
  const files = formData
    .getAll('documents')
    .filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length > MAX_DOCS) {
    redirect('/admissions?error=failed')
  }
  const documentPaths: string[] = []
  if (files.length > 0) {
    const admin = createAdminClient()
    for (const file of files) {
      if (file.size > MAX_DOC_BYTES || !ALLOWED_DOC_TYPES.has(file.type)) {
        redirect('/admissions?error=failed')
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100) || 'file'
      const path = `applications/${randomUUID()}/${safeName}`
      const buffer = Buffer.from(await file.arrayBuffer())
      const { error: upErr } = await admin.storage
        .from(DOC_BUCKET)
        .upload(path, buffer, { contentType: file.type, upsert: false })
      if (upErr) {
        console.error('Admission document upload failed:', upErr.message)
        redirect('/admissions?error=failed')
      }
      documentPaths.push(path)
    }
  }

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
      // Only set when files were uploaded, so the form still works before the
      // `documents` column migration is applied.
      ...(documentPaths.length ? { documents: documentPaths } : {}),
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
