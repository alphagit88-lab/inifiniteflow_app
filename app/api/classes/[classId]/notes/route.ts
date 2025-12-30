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
    // Fetch notes with user profile information
    const { data, error } = await supabaseAdmin
      .from('class_notes')
      .select(`
        note_id,
        class_id,
        user_id,
        note_content,
        created_at,
        updated_at,
        is_archived,
        profiles:user_id (
          user_id,
          nickname,
          email
        )
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/classes/[classId]/notes] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to flatten the profile information
    const notes = (data || []).map((note: any) => ({
      note_id: note.note_id,
      class_id: note.class_id,
      user_id: note.user_id,
      note_content: note.note_content,
      created_at: note.created_at,
      updated_at: note.updated_at,
      is_archived: note.is_archived,
      user: note.profiles ? {
        user_id: note.profiles.user_id,
        nickname: note.profiles.nickname,
        email: note.profiles.email,
      } : null,
    }))

    return NextResponse.json({ data: notes })
  } catch (err) {
    console.error('[GET /api/classes/[classId]/notes] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

