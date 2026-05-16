import PolicyViewer from '@/components/PolicyViewer'
import { ADMIN_STAFF_POLICY, TEACHER_POLICY, STUDENT_POLICY, VOLUNTEER_POLICY, DISCLAIMER_POLICY } from '@/lib/policies'

const TABS = [
  { id: 'admin',      label: 'Admin Policy',     icon: '🏛️', accentColor: 'blue',    policy: ADMIN_STAFF_POLICY },
  { id: 'teacher',    label: 'Teacher Policy',   icon: '👨‍🏫', accentColor: 'blue',   policy: TEACHER_POLICY },
  { id: 'student',    label: 'Student Policy',   icon: '🎓', accentColor: 'emerald', policy: STUDENT_POLICY },
  { id: 'volunteer',  label: 'Volunteer Policy', icon: '🤝', accentColor: 'rose',    policy: VOLUNTEER_POLICY },
  { id: 'disclaimer', label: 'Disclaimer',       icon: '⚖️', accentColor: 'slate',   policy: DISCLAIMER_POLICY },
]

export default function AdminPoliciesPage() {
  return <PolicyViewer tabs={TABS} />
}
