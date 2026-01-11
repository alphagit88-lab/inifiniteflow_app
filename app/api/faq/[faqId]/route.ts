import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RouteContext {
  params: Promise<{
    faqId: string
  }>
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { faqId } = await params

  if (!faqId) {
    return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin
      .from('help_faq')
      .delete()
      .eq('id', faqId)

    if (error) {
      console.error('[DELETE /api/faq/[faqId]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/faq/[faqId]] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { faqId } = await params

  if (!faqId) {
    return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  const updates: Record<string, any> = {}

  if (typeof payload.question === 'string' && payload.question.trim()) {
    updates.question = payload.question.trim()
  }

  if (typeof payload.answer === 'string' && payload.answer.trim()) {
    updates.answer = payload.answer.trim()
  }

  if (typeof payload.display_order === 'number') {
    updates.display_order = payload.display_order
  }

  if (typeof payload.is_published === 'boolean') {
    updates.is_published = payload.is_published
  }

  updates.updated_at = new Date().toISOString()

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('help_faq')
      .update(updates)
      .eq('id', faqId)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[PATCH /api/faq/[faqId]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PATCH /api/faq/[faqId]] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
