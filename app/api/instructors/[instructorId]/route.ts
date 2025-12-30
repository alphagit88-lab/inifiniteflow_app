import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RouteContext {
  params: Promise<{
    instructorId: string
  }>
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { instructorId } = await params

  if (!instructorId) {
    return NextResponse.json({ error: 'Instructor ID is required' }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin
      .from('instructor')
      .delete()
      .eq('instructor_id', instructorId)

    if (error) {
      console.error('[DELETE /api/instructors/[instructorId]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/instructors/[instructorId]] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { instructorId } = await params

  if (!instructorId) {
    return NextResponse.json({ error: 'Instructor ID is required' }, { status: 400 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  const updates: Record<string, any> = {}

  if (typeof payload.bio === 'string') {
    updates.bio = payload.bio.trim()
  }

  if (typeof payload.is_featured === 'boolean') {
    updates.is_featured = payload.is_featured
  }

  if (typeof payload.total_students === 'number') {
    updates.total_students = payload.total_students
  }

  if (typeof payload.total_classes === 'number') {
    updates.total_classes = payload.total_classes
  }

  if (Array.isArray(payload.specialization) || payload.specialization === null) {
    updates.specialization = payload.specialization
  }

  if (Array.isArray(payload.certifications) || payload.certifications === null) {
    updates.certifications = payload.certifications
  }

  if (typeof payload.years_experience === 'number' || payload.years_experience === null) {
    updates.years_experience = payload.years_experience
  }

  if (typeof payload.profile_video_url === 'string' || payload.profile_video_url === null) {
    updates.profile_video_url = payload.profile_video_url ? payload.profile_video_url.trim() : null
  }

  if (payload.social_media_links !== undefined) {
    updates.social_media_links = payload.social_media_links
  }

  if (typeof payload.rating === 'number' || payload.rating === null) {
    updates.rating = payload.rating
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('instructor')
      .update(updates)
      .eq('instructor_id', instructorId)
      .select('*')
      .maybeSingle()

    if (error) {
      console.error('[PATCH /api/instructors/[instructorId]] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PATCH /api/instructors/[instructorId]] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

