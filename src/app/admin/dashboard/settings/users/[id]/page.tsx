import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCog } from '@/components/Icons'
import { requireSuperAdmin } from '@/utils/supabase/auth'
import UserEditForm from './UserEditForm'

export const metadata = { title: 'Edit User' }

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let ctx
  try {
    ctx = await requireSuperAdmin()
  } catch {
    redirect('/admin/dashboard?message=Super admin required')
  }

  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('id, full_name, email, role, is_board, is_treasurer, created_at')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/dashboard/settings/users"
          className="mb-4 inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to User Management
        </Link>
        <h1 className="flex items-center font-playfair text-3xl font-bold text-slate-900">
          <UserCog className="mr-3 h-8 w-8 text-blue-700" />
          Edit User
        </h1>
        <p className="mt-1 text-slate-500">{profile.email}</p>
      </div>

      <UserEditForm
        user={{
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          role: profile.role,
          is_board: !!profile.is_board,
          is_treasurer: !!profile.is_treasurer,
        }}
        isSelf={profile.id === ctx.user.id}
      />
    </div>
  )
}
