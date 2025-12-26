import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/supabaseClient'

interface RouteContext {
  params: Promise<{
    userId: string
  }>
}

export async function DELETE(_: Request, context: RouteContext) {
  const { userId } = await context.params

  if (!userId) {
    return NextResponse.json({ error: 'User identifier is required' }, { status: 400 })
  }

  const { error } = await supabase.from('profiles').delete().eq('user_id', userId).eq('user_type', 'S')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await context.params

  if (!userId) {
    return NextResponse.json({ error: 'User identifier is required' }, { status: 400 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  const updates: Record<string, string> = {}

  if (typeof payload.nickname === 'string') {
    updates.nickname = payload.nickname.trim()
  }

  if (typeof payload.email === 'string') {
    updates.email = payload.email.trim()
  }

  if (typeof payload.subscription_status === 'string') {
    updates.subscription_status = payload.subscription_status.trim()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .eq('user_type', 'S')
    .select('user_id, nickname, email, user_type, subscription_status, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

