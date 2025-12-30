import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  // Validate required fields
  if (!payload.instructor_id || !payload.bio) {
    return NextResponse.json({ error: 'Instructor ID and bio are required' }, { status: 400 })
  }

  // Build insert object
  const insertData: Record<string, any> = {
    instructor_id: payload.instructor_id.trim(),
    bio: payload.bio.trim(),
    is_featured: payload.is_featured !== undefined ? payload.is_featured : false,
    total_students: payload.total_students || 0,
    total_classes: payload.total_classes || 0,
    specialization: payload.specialization || null,
    certifications: payload.certifications || null,
    years_experience: payload.years_experience || null,
    profile_video_url: payload.profile_video_url || null,
    social_media_links: payload.social_media_links || null,
    rating: payload.rating || null,
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('instructor')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      console.error('[POST /api/instructors] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/instructors] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

