import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PortalLoginForm from '../PortalLoginForm'
import Image from 'next/image'

export default async function EventsLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const { message } = await searchParams

  // If already logged in with the right role, skip login
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'event_uploader' || profile?.role === 'admin') {
      redirect('/admin/event-uploader')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundImage: 'url(/images/dashboard/uploader_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-sm z-0"></div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100 z-10">
        <div className="bg-gradient-to-r from-purple-800 to-violet-900 p-8 text-center relative overflow-hidden">
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
          <h1 className="text-2xl font-playfair font-bold text-white mb-1">Event Uploader Portal</h1>
          <p className="text-purple-200 text-sm">SoCal Academy of Knowledge</p>
        </div>

        <PortalLoginForm message={message} role="event_uploader" />
      </div>
    </div>
  )
}
