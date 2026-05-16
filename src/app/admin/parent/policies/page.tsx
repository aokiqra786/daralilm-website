import PolicyViewer from '@/components/PolicyViewer'
import { STUDENT_POLICY, DISCLAIMER_POLICY } from '@/lib/policies'

const TABS = [
  { id: 'student',    label: 'Student Policy', icon: '🎓', accentColor: 'emerald', policy: STUDENT_POLICY },
  { id: 'disclaimer', label: 'Disclaimer',     icon: '⚖️', accentColor: 'slate',   policy: DISCLAIMER_POLICY },
]

export default function ParentPoliciesPage() {
  return <PolicyViewer tabs={TABS} />
}
