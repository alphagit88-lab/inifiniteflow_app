import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RouteContext {
  params: Promise<{
    classId: string
  }> | {
    classId: string
  }
}

export async function GET(_: Request, { params }: RouteContext) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { classId } = resolvedParams

  if (!classId) {
    return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('classes')
    .select('*')
    .eq('class_id', classId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { classId } = resolvedParams

  if (!classId) {
    return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('classes').delete().eq('class_id', classId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { classId } = resolvedParams

  if (!classId) {
    return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  const updates: Record<string, any> = {}

  if (typeof payload.class_name === 'string') {
    updates.class_name = payload.class_name.trim()
  }

  if (typeof payload.description === 'string') {
    updates.description = payload.description.trim()
  }

  if (typeof payload.category === 'string') {
    updates.category = payload.category.trim()
  }

  if (typeof payload.level === 'string') {
    updates.level = payload.level.trim()
  }

  if (typeof payload.duration === 'number') {
    updates.duration = payload.duration
  }

  if (typeof payload.intensity_level === 'string') {
    updates.intensity_level = payload.intensity_level.trim()
  }

  if (typeof payload.is_premium === 'boolean') {
    updates.is_premium = payload.is_premium
  }

  if (typeof payload.is_published === 'boolean') {
    updates.is_published = payload.is_published
  }

  if (typeof payload.notes === 'string') {
    updates.notes = payload.notes.trim() || null
  }

  if (typeof payload.instructor_id === 'string') {
    updates.instructor_id = payload.instructor_id.trim()
  }

  if (typeof payload.challenge === 'boolean') {
    updates.challenge = payload.challenge
  }

  if (typeof payload.badge === 'string') {
    updates.badge = payload.badge.trim() || null
  }

  if (payload.challenge_start_date !== undefined) {
    updates.challenge_start_date = payload.challenge_start_date ? new Date(payload.challenge_start_date).toISOString() : null
  }

  if (payload.challenge_end_date !== undefined) {
    updates.challenge_end_date = payload.challenge_end_date ? new Date(payload.challenge_end_date).toISOString() : null
  }

  // Update the updated_at timestamp
  updates.updated_at = new Date().toISOString()

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('classes')
    .update(updates)
    .eq('class_id', classId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

