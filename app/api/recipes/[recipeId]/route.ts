import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

interface RouteContext {
  params: {
    recipeId: string
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { recipeId } = params

  if (!recipeId) {
    return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('recipes').delete().eq('recipe_id', recipeId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { recipeId } = params

  if (!recipeId) {
    return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
  }

  const payload = await request.json().catch(() => null)

  if (!payload) {
    return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
  }

  const updates: Record<string, any> = {}

  if (typeof payload.recipe_name === 'string') {
    updates.recipe_name = payload.recipe_name.trim()
  }

  if (typeof payload.description === 'string') {
    updates.description = payload.description.trim()
  }

  if (typeof payload.instructions === 'string' || payload.instructions === null) {
    updates.instructions = payload.instructions ? payload.instructions.trim() : null
  }

  if (typeof payload.prep_time_minutes === 'number') {
    updates.prep_time_minutes = payload.prep_time_minutes
  }

  if (typeof payload.cook_time_minutes === 'number') {
    updates.cook_time_minutes = payload.cook_time_minutes
  }

  if (typeof payload.servings === 'number') {
    updates.servings = payload.servings
  }

  if (typeof payload.difficulty === 'string') {
    updates.difficulty = payload.difficulty.trim()
  }

  if (typeof payload.class_name === 'string') {
    updates.class_name = payload.class_name.trim()
  }

  if (typeof payload.is_premium === 'boolean') {
    updates.is_premium = payload.is_premium
  }

  if (typeof payload.is_published === 'boolean') {
    updates.is_published = payload.is_published
  }

  if (typeof payload.calories_per_serving === 'number' || payload.calories_per_serving === null) {
    updates.calories_per_serving = payload.calories_per_serving
  }

  if (typeof payload.protein_grams === 'number' || payload.protein_grams === null) {
    updates.protein_grams = payload.protein_grams
  }

  if (typeof payload.carbs_grams === 'number' || payload.carbs_grams === null) {
    updates.carbs_grams = payload.carbs_grams
  }

  if (typeof payload.fat_grams === 'number' || payload.fat_grams === null) {
    updates.fat_grams = payload.fat_grams
  }

  if (typeof payload.fiber_grams === 'number' || payload.fiber_grams === null) {
    updates.fiber_grams = payload.fiber_grams
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .update(updates)
    .eq('recipe_id', recipeId)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

