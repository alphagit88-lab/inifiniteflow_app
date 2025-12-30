import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RouteContext {
  params: Promise<{
    bannerId: string
  }>
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { bannerId } = await params

  if (!bannerId) {
    return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin
      .from('recipe_banners')
      .delete()
      .eq('banner_id', bannerId)

    if (error) {
      console.error('[DELETE /api/recipe-banners/[bannerId]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/recipe-banners/[bannerId]] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { bannerId } = await params

  if (!bannerId) {
    return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  const updates: Record<string, any> = {}

  if (typeof payload.image_url === 'string') {
    updates.image_url = payload.image_url.trim()
  }

  if (typeof payload.title === 'string' || payload.title === null) {
    updates.title = payload.title ? payload.title.trim() : null
  }

  if (typeof payload.subtitle === 'string' || payload.subtitle === null) {
    updates.subtitle = payload.subtitle ? payload.subtitle.trim() : null
  }

  if (typeof payload.is_active === 'boolean') {
    updates.is_active = payload.is_active
  }

  if (typeof payload.display_order === 'number') {
    updates.display_order = payload.display_order
  }

  updates.updated_at = new Date().toISOString()

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('recipe_banners')
      .update(updates)
      .eq('banner_id', bannerId)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[PATCH /api/recipe-banners/[bannerId]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PATCH /api/recipe-banners/[bannerId]] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

