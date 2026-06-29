import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Maps a requireAdmin()/requireSuperAdmin() throw into a JSON response:
// no session -> 401, wrong role -> 403. Use in route handlers' catch blocks.
export function authErrorResponse(e: unknown) {
  const message = e instanceof Error ? e.message : 'Unauthorized'
  const status = message === 'Unauthorized' ? 401 : 403
  return NextResponse.json({ error: status === 401 ? 'Unauthorized' : 'Forbidden' }, { status })
}

export async function requireAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    throw new Error('Unauthorized role')
  }

  return { supabase, user, profile }
}

export async function requireSuperAdmin() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'super_admin') {
    throw new Error('Unauthorized role: super_admin required')
  }

  return { supabase, user, profile }
}

// ─── Event workflow roles ──────────────────────────────────────────────────
// Board and treasurer are boolean flags on profiles (is_board/is_treasurer),
// added by event_workflow_migration.sql, so we never touch the role CHECK.
export type EventStaffProfile = {
  role: string
  is_board: boolean | null
  is_treasurer: boolean | null
}

async function getCaller() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_board, is_treasurer')
    .eq('id', user.id)
    .single()
  if (!profile) throw new Error('Unauthorized')
  return { supabase, user, profile: profile as EventStaffProfile }
}

export function isAdminRole(p: EventStaffProfile) {
  return p.role === 'admin' || p.role === 'super_admin'
}
export function isBoard(p: EventStaffProfile) {
  return isAdminRole(p) || !!p.is_board
}
export function isTreasurer(p: EventStaffProfile) {
  return p.role === 'super_admin' || !!p.is_treasurer
}

// Anyone who may create/submit an event proposal.
export async function requireEventStaff() {
  const ctx = await getCaller()
  const p = ctx.profile
  if (!(isAdminRole(p) || p.is_board || p.is_treasurer || p.role === 'event_uploader')) {
    throw new Error('Unauthorized role')
  }
  return ctx
}

// Board reviewers (admins included).
export async function requireBoard() {
  const ctx = await getCaller()
  if (!isBoard(ctx.profile)) throw new Error('Unauthorized role')
  return ctx
}

// Treasurer (super_admin included).
export async function requireTreasurer() {
  const ctx = await getCaller()
  if (!isTreasurer(ctx.profile)) throw new Error('Unauthorized role')
  return ctx
}
