import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function PATCH(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!payload || !Array.isArray(payload.faqs)) {
    return NextResponse.json({ error: 'Missing or invalid request body. Expected array of FAQs with id and display_order' }, { status: 400 })
  }

  try {
    // Update display_order for all FAQs
    const updatePromises = payload.faqs.map((faq: { id: string; display_order: number }) =>
      supabaseAdmin
        .from('help_faq')
        .update({ display_order: faq.display_order, updated_at: new Date().toISOString() })
        .eq('id', faq.id)
    )

    const results = await Promise.all(updatePromises)
    const errors = results.filter((result) => result.error)

    if (errors.length > 0) {
      console.error('[PATCH /api/faq/reorder] Errors:', errors)
      return NextResponse.json({ error: 'Failed to update some FAQs' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/faq/reorder] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
