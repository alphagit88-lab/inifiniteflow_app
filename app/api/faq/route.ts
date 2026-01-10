import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('help_faq')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('[GET /api/faq] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (err) {
    console.error('[GET /api/faq] Unexpected error:', err)
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

  if (!payload.question || typeof payload.question !== 'string' || !payload.question.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  if (!payload.answer || typeof payload.answer !== 'string' || !payload.answer.trim()) {
    return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
  }

  try {
    // Get the maximum display_order to set the new FAQ at the end
    const { data: existingFaqs, error: countError } = await supabaseAdmin
      .from('help_faq')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)

    if (countError) {
      console.error('[POST /api/faq] Error getting max display_order:', countError)
    }

    const maxOrder = existingFaqs && existingFaqs.length > 0 ? existingFaqs[0].display_order + 1 : 0

    const { data, error } = await supabaseAdmin
      .from('help_faq')
      .insert({
        question: payload.question.trim(),
        answer: payload.answer.trim(),
        display_order: typeof payload.display_order === 'number' ? payload.display_order : maxOrder,
        is_published: typeof payload.is_published === 'boolean' ? payload.is_published : true,
      })
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[POST /api/faq] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[POST /api/faq] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
