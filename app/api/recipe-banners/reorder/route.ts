import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function PATCH(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!payload || !Array.isArray(payload.banners)) {
    return NextResponse.json({ error: 'Missing or invalid request body. Expected array of banners with banner_id and display_order' }, { status: 400 })
  }

  try {
    // Update display_order for all banners
    const updatePromises = payload.banners.map((banner: { banner_id: string; display_order: number }) =>
      supabaseAdmin
        .from('recipe_banners')
        .update({ display_order: banner.display_order, updated_at: new Date().toISOString() })
        .eq('banner_id', banner.banner_id)
    )

    const results = await Promise.all(updatePromises)
    const errors = results.filter((result) => result.error)

    if (errors.length > 0) {
      console.error('[PATCH /api/recipe-banners/reorder] Errors:', errors)
      return NextResponse.json({ error: 'Failed to update some banners' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/recipe-banners/reorder] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

