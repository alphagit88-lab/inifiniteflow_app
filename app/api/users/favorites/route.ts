import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ocfufnbhqxzwsrxxulup.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZnVmbmJocXh6d3NyeHh1bHVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzMTQ0NywiZXhwIjoyMDc4OTA3NDQ3fQ.B9JSyL6eTg99732hPbUFazai3tLwqGMf2j9zxUx7mfo'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// GET /api/users/favorites - Get user's favorites (classes, meals)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'class' or 'recipe'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('favorites')
      .select('*, classes(*), recipes(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('item_type', type)
    }

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/users/favorites] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('[GET /api/users/favorites] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// POST /api/users/favorites - Add to favorites
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const { user_id, item_id, item_type } = payload

    if (!user_id || !item_id || !item_type) {
      return NextResponse.json(
        { error: 'user_id, item_id, and item_type are required' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const { data: existing } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('item_id', item_id)
      .eq('item_type', item_type)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 409 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id,
        item_id,
        item_type,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/users/favorites] Error:', error)
      return NextResponse.json(
        { error: 'Failed to add to favorites' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/users/favorites] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/favorites - Remove from favorites
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const itemId = searchParams.get('itemId')
    const itemType = searchParams.get('itemType')

    if (!userId || !itemId || !itemType) {
      return NextResponse.json(
        { error: 'userId, itemId, and itemType are required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType)

    if (error) {
      console.error('[DELETE /api/users/favorites] Error:', error)
      return NextResponse.json(
        { error: 'Failed to remove from favorites' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    })
  } catch (error) {
    console.error('[DELETE /api/users/favorites] Unexpected error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
