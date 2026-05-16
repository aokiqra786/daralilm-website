import { Suspense } from 'react'
import VolunteerPageClient from './VolunteerPageClient'

export default function VolunteersPage() {
  return (
    <Suspense>
      <VolunteerPageClient />
    </Suspense>
  )
}
