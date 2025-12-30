import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('class_banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[GET /api/banners] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('[GET /api/banners] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  // Validate required fields
  if (!payload.image_url) {
    return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
  }

  // Get the maximum display_order to set the new banner's order
  const { data: maxOrderData } = await supabaseAdmin
    .from('class_banners')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = maxOrderData?.display_order !== undefined ? maxOrderData.display_order + 1 : 0

  // Build insert object
  const insertData: Record<string, any> = {
    image_url: payload.image_url.trim(),
    title: payload.title ? payload.title.trim() : null,
    subtitle: payload.subtitle ? payload.subtitle.trim() : null,
    is_active: payload.is_active !== undefined ? payload.is_active : true,
    display_order: payload.display_order !== undefined ? payload.display_order : nextOrder,
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('class_banners')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      console.error('[POST /api/banners] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/banners] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

