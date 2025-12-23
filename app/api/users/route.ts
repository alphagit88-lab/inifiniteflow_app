import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/supabaseClient'

const PROFILE_SELECT = 'id, user_id, nickname, email, user_type, subscription_status, created_at'

export async function GET() {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('user_type', 'S')
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

  const newProfile = {
    user_id: crypto.randomUUID(),
    nickname: payload.nickname.trim(),
    email: payload.email.trim(),
    user_type: 'S',
    subscription_status: payload.subscription_status || 'Active',
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select(PROFILE_SELECT)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

