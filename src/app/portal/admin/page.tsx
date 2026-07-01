import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PortalLoginForm from '../PortalLoginForm'
import Image from 'next/image'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  // If already logged in as admin, skip login
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      redirect('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundImage: 'url(/images/dashboard/admin_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-blue-950/90 backdrop-blur-md z-0"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-900/50 z-10">
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-8 text-center relative overflow-hidden">
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
          <h1 className="text-2xl font-playfair font-bold text-white mb-1">System Administrator</h1>
          <p className="text-blue-300 text-sm tracking-widest uppercase">Secure Access</p>
        </div>

        <PortalLoginForm message={message} role="admin" />
      </div>
    </div>
  )
}
