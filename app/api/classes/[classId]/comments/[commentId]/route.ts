import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RouteContext {
  params: Promise<{
    classId: string
    commentId: string
  }>
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { commentId } = await params

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin
      .from('class_comments')
      .delete()
      .eq('comment_id', commentId)

    if (error) {
      console.error('[DELETE /api/classes/[classId]/comments/[commentId]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/classes/[classId]/comments/[commentId]] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { commentId } = await params

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  const updates: Record<string, any> = {}

  if (typeof payload.is_marked_hidden === 'boolean') {
    updates.is_marked_hidden = payload.is_marked_hidden
    updates.updated_at = new Date().toISOString()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('class_comments')
      .update(updates)
      .eq('comment_id', commentId)
      .select(`
        comment_id,
        class_id,
        user_id,
        comment_text,
        created_at,
        updated_at,
        is_marked_hidden,
        profiles:user_id (
          user_id,
          nickname,
          email
        )
      `)
      .single()

    if (error) {
      console.error('[PATCH /api/classes/[classId]/comments/[commentId]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to flatten the profile information
    const comment = {
      comment_id: data.comment_id,
      class_id: data.class_id,
      user_id: data.user_id,
      comment_text: data.comment_text,
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_marked_hidden: data.is_marked_hidden,
      user: (data as any).profiles ? {
        user_id: (data as any).profiles.user_id,
        nickname: (data as any).profiles.nickname,
        email: (data as any).profiles.email,
      } : null,
    }

    return NextResponse.json({ data: comment })
  } catch (err) {
    console.error('[PATCH /api/classes/[classId]/comments/[commentId]] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

