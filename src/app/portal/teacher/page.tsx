import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PortalLoginForm from '../PortalLoginForm'
import Image from 'next/image'
import MaintenanceScreen from '../MaintenanceScreen'

export default async function TeacherLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  // Block during local testing
  if (process.env.PORTAL_MAINTENANCE === 'true') {
    return <MaintenanceScreen portalName="Teacher Portal" color="from-amber-700 to-orange-800" textColor="text-amber-200" />
  }

  // If already logged in with the right role, skip login
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'teacher' || profile?.role === 'admin') {
      redirect('/admin/teacher')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundImage: 'url(/images/dashboard/teacher_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-amber-950/80 backdrop-blur-sm z-0"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100 z-10">
        <div className="bg-gradient-to-r from-amber-700 to-orange-800 p-8 text-center relative overflow-hidden">
          <div className="relative h-20 w-72 mx-auto mb-4">
            <Image
              src="/new_logo.png"
              alt="SoCal Academy of Knowledge"
              fill
              quality={100}
              sizes="288px"
              className="object-contain object-center drop-shadow-2xl contrast-105 saturate-110"
              priority
            />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-white mb-1">Teacher Portal</h1>
          <p className="text-amber-200 text-sm">SoCal Academy of Knowledge</p>
        </div>

        <PortalLoginForm message={message} role="teacher" />
      </div>
    </div>
  )
}
