import PolicyViewer from '@/components/PolicyViewer'
import { TEACHER_POLICY, STUDENT_POLICY, DISCLAIMER_POLICY } from '@/lib/policies'

const TABS = [
  { id: 'teacher',    label: 'Teacher Policy', icon: '👨‍🏫', accentColor: 'amber', policy: TEACHER_POLICY },
  { id: 'student',    label: 'Student Policy', icon: '🎓',  accentColor: 'amber', policy: STUDENT_POLICY },
  { id: 'disclaimer', label: 'Disclaimer',     icon: '⚖️',  accentColor: 'slate', policy: DISCLAIMER_POLICY },
]

export default function TeacherPoliciesPage() {
  return <PolicyViewer tabs={TABS} />
}
