import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ParentLoginForm from './ParentLoginForm'
import Image from 'next/image'
import MaintenanceScreen from '../../portal/MaintenanceScreen'

export default async function ParentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  // Block during local testing
  if (process.env.PORTAL_MAINTENANCE === 'true') {
    return <MaintenanceScreen portalName="Parent Portal" color="from-emerald-800 to-teal-900" textColor="text-emerald-200" />
  }

  // If already logged in as parent, skip login
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'parent' || profile?.role === 'admin') {
      redirect('/admin/parent')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundImage: 'url(/images/dashboard/parent_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-0"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100 z-10">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-8 text-center relative overflow-hidden">
          <div className="relative h-20 w-72 mx-auto mb-4">
            <Image
              src="/brand/logo/AoK_Logo_Color_white.png"
              alt="SoCal Academy of Knowledge"
              fill
              quality={100}
              sizes="288px"
              className="object-contain object-center drop-shadow-2xl contrast-105 saturate-110"
              priority
            />
          </div>
          <h1 className="text-2xl font-playfair font-bold text-white mb-1">Parent Portal</h1>
          <p className="text-emerald-200 text-sm">SoCal Academy of Knowledge</p>
        </div>

        <ParentLoginForm message={message} />
      </div>
    </div>
  )
}
