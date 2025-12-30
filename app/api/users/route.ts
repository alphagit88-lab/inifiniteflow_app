import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

const PROFILE_SELECT = 'user_id, nickname, email, user_type, subscription_status, created_at'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(PROFILE_SELECT)
    .neq('user_type', 'A')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!payload || !payload.nickname || !payload.email) {
    return NextResponse.json({ error: 'Nickname and email are required' }, { status: 400 })
  }

  // Validate and normalize subscription_status
  const validStatuses = ['active', 'inactive', 'cancelled']
  let subscriptionStatus = 'active' // default
  if (payload.subscription_status) {
    const normalizedStatus = payload.subscription_status.trim().toLowerCase()
    if (validStatuses.includes(normalizedStatus)) {
      subscriptionStatus = normalizedStatus
    } else {
      return NextResponse.json(
        { error: `Invalid subscription_status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }
  }

  const newProfile = {
    user_id: crypto.randomUUID(),
    nickname: payload.nickname.trim(),
    email: payload.email.trim(),
    first_name: payload.nickname.trim(), // Required field
    last_name: '', // Required field, set to empty string
    user_type: 'S',
    subscription_status: subscriptionStatus,
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert(newProfile)
    .select(PROFILE_SELECT)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

