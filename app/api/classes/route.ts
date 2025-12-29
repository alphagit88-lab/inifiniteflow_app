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
  if (!payload.class_name || !payload.description) {
    return NextResponse.json({ error: 'Class name and description are required' }, { status: 400 })
  }

  if (!payload.instructor_id) {
    return NextResponse.json({ error: 'Instructor is required' }, { status: 400 })
  }

  if (!payload.duration || payload.duration <= 0) {
    return NextResponse.json({ error: 'Duration must be greater than 0' }, { status: 400 })
  }

  // Build insert object with required and optional fields
  const insertData: Record<string, any> = {
    class_name: payload.class_name.trim(),
    description: payload.description.trim(),
    category: payload.category || 'Pilates', // Default to Pilates
    level: payload.level || 'Beginner',
    duration: payload.duration,
    intensity_level: payload.intensity_level || 'Low',
    is_premium: payload.is_premium !== undefined ? payload.is_premium : false,
    is_published: payload.is_published !== undefined ? payload.is_published : false,
    notes: payload.notes ? payload.notes.trim() : null,
    challenge: payload.challenge !== undefined ? payload.challenge : false,
    badge: payload.badge ? payload.badge.trim() : null,
    challenge_start_date: payload.challenge_start_date ? new Date(payload.challenge_start_date).toISOString() : null,
    challenge_end_date: payload.challenge_end_date ? new Date(payload.challenge_end_date).toISOString() : null,
    // Set required instructor_id
    instructor_id: payload.instructor_id,
    body_area: payload.body_area || [],
    video_url: payload.video_url || '',
    thumbnail_image: payload.thumbnail_image || '',
    equipment_list: payload.equipment_list || [],
    view_count: 0,
    completion_count: 0,
  }

  const { data, error } = await supabaseAdmin
    .from('classes')
    .insert(insertData)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

