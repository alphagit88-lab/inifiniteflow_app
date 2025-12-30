import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RouteContext {
  params: Promise<{
    userId: string
  }>
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { userId } = await params

  if (!userId) {
    return NextResponse.json({ error: 'User identifier is required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('profiles').delete().eq('user_id', userId).neq('user_type', 'A')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { userId } = await params

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
    const subscriptionStatus = payload.subscription_status.trim().toLowerCase()
    // Validate against database constraint: 'active', 'inactive', or 'cancelled'
    const validStatuses = ['active', 'inactive', 'cancelled']
    if (validStatuses.includes(subscriptionStatus)) {
      updates.subscription_status = subscriptionStatus
    } else {
      return NextResponse.json(
        { error: `Invalid subscription_status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  // First check if the user exists (exclude admins, same as getUserProfiles)
  const { data: existingUser, error: checkError } = await supabaseAdmin
    .from('profiles')
    .select('user_id, user_type')
    .eq('user_id', userId)
    .neq('user_type', 'A')
    .maybeSingle()

  if (checkError) {
    console.error('[PATCH /api/users/[userId]] Error checking user:', checkError)
    return NextResponse.json({ error: checkError.message }, { status: 500 })
  }

  if (!existingUser) {
    return NextResponse.json({ error: 'User not found or is an admin' }, { status: 404 })
  }

  // Update the user (exclude admins, same as getUserProfiles)
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .neq('user_type', 'A')
    .select('user_id, nickname, email, user_type, subscription_status, created_at')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

