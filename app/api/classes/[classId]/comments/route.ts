import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RouteContext {
  params: Promise<{
    classId: string
  }>
}

export async function GET(_: Request, { params }: RouteContext) {
  const { classId } = await params

  if (!classId) {
    return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
  }

  try {
    // Fetch comments with user profile information (including hidden ones for admin)
    const { data, error } = await supabaseAdmin
      .from('class_comments')
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
      .eq('class_id', classId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/classes/[classId]/comments] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to flatten the profile information
    const comments = (data || []).map((comment: any) => ({
      comment_id: comment.comment_id,
      class_id: comment.class_id,
      user_id: comment.user_id,
      comment_text: comment.comment_text,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      is_marked_hidden: comment.is_marked_hidden,
      user: comment.profiles ? {
        user_id: comment.profiles.user_id,
        nickname: comment.profiles.nickname,
        email: comment.profiles.email,
      } : null,
    }))

    return NextResponse.json({ data: comments })
  } catch (err) {
    console.error('[GET /api/classes/[classId]/comments] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

