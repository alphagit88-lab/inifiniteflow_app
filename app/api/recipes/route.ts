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
  if (!payload.recipe_name || !payload.description) {
    return NextResponse.json({ error: 'Recipe name and description are required' }, { status: 400 })
  }

  if (!payload.class_name) {
    return NextResponse.json({ error: 'Class name is required' }, { status: 400 })
  }

  if (!payload.prep_time_minutes || payload.prep_time_minutes <= 0) {
    return NextResponse.json({ error: 'Prep time must be greater than 0' }, { status: 400 })
  }

  if (!payload.cook_time_minutes || payload.cook_time_minutes <= 0) {
    return NextResponse.json({ error: 'Cook time must be greater than 0' }, { status: 400 })
  }

  if (!payload.servings || payload.servings <= 0) {
    return NextResponse.json({ error: 'Servings must be greater than 0' }, { status: 400 })
  }

  // Build insert object with required and optional fields
  const insertData: Record<string, any> = {
    recipe_name: payload.recipe_name.trim(),
    description: payload.description.trim(),
    instructions: payload.instructions ? payload.instructions.trim() : null,
    prep_time_minutes: payload.prep_time_minutes,
    cook_time_minutes: payload.cook_time_minutes,
    servings: payload.servings,
    difficulty: payload.difficulty || 'Easy',
    class_name: payload.class_name.trim(),
    is_premium: payload.is_premium !== undefined ? payload.is_premium : false,
    is_published: payload.is_published !== undefined ? payload.is_published : false,
    calories_per_serving: payload.calories_per_serving || null,
    protein_grams: payload.protein_grams || null,
    carbs_grams: payload.carbs_grams || null,
    fat_grams: payload.fat_grams || null,
    fiber_grams: payload.fiber_grams || null,
    meal_type: payload.meal_type || null,
    banner_image: payload.banner_image || null,
    // Set default values for fields that might be required by the schema
    image_url: payload.image_url || '',
    ingredients: payload.ingredients || [],
    tags: payload.tags || [],
  }

  const { data, error } = await supabaseAdmin
    .from('recipes')
    .insert(insertData)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}

