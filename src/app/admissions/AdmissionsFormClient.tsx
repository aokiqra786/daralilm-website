'use client'

import { submitAdmissionApplication } from './actions'
import { Input, Select, Textarea, Button } from '@/components/ui'

export default function AdmissionsFormClient() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-t-4 border-amber-500">
      <h2 className="text-xl sm:text-2xl font-playfair font-bold text-blue-900 mb-6 text-center">
        Student Application Form
      </h2>

      <form action={submitAdmissionApplication} className="space-y-6">
        {/* Honeypot — hidden from users; bot submissions are dropped server-side */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

        {/* Parent Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
            Parent / Guardian Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="First Name" name="parentFirstName" type="text" required placeholder="Enter first name" />
            <Input label="Last Name" name="parentLastName" type="text" required placeholder="Enter last name" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Email Address" name="parentEmail" type="email" required placeholder="email@example.com" />
            <Input label="Phone Number" name="parentPhone" type="tel" required placeholder="818-452-5237" />
          </div>
        </div>

        {/* Student Info */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Student Full Name" name="studentName" type="text" required placeholder="Student name" />
            <Input label="Date of Birth" name="dateOfBirth" type="date" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Gender" name="gender" required defaultValue="">
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </div>

          <Select label="Program of Interest" name="programInterest" required defaultValue="">
            <option value="">Select a program...</option>
            <option value="Evening Qur'an Classes">Evening Qur&apos;an Classes</option>
            <option value="Weekend School">Weekend School</option>
            <option value="Hifz Program">Full-Time Hifz Program</option>
            <option value="K-12 Academic Support">K-12 Homeschool Academic Support</option>
            <option value="Vocational Programs">Vocational Programs</option>
            <option value="Youth Activities">Youth Activities</option>
          </Select>

          <Textarea label="Additional Notes / Medical Info" name="notes" rows={3} placeholder="Any information we should know..." />

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Supporting Documents <span className="text-muted">(optional)</span>
            </label>
            <input
              type="file"
              name="documents"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
              className="w-full text-sm text-ink file:mr-4 file:rounded-md file:border-0 file:bg-parchment file:px-4 file:py-2 file:text-sm file:font-semibold file:text-green hover:file:bg-line"
            />
            <p className="text-xs text-muted mt-1">
              Birth certificate, immunization records, report card, or photo. PDF/JPG/PNG, up to 5 MB each (max 5 files).
            </p>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Submit Application
        </Button>
        <p className="text-xs text-center text-muted mt-2">
          By submitting, you agree to SoCal Academy of Knowledge&apos;s admissions policies.
        </p>
      </form>
    </div>
  )
}
