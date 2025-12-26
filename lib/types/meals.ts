// Meal Types - Integrated with Supabase API

/**
 * Recipe interface matching the Supabase database schema
 */
export interface Recipe {
  recipe_id: string
  recipe_name: string
  description: string | null
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  servings: number | null
  difficulty: string | null
  image_url: string | null
  ingredients: Ingredient[] | null
  instructions: string[] | null
  tags: string[] | null
  is_premium: boolean
  is_published: boolean
  created_at: string
  class_name: string | null // Category: Breakfast, Lunch, Dinner, Snacks
  calories_per_serving: number | null
  protein_grams: number | null
  carbs_grams: number | null
  fat_grams: number | null
  fiber_grams: number | null
}

export interface Ingredient {
  name: string
  amount: string
  unit?: string
}

/**
 * Simplified Meal interface for list views (mapped from Recipe)
 */
export interface Meal {
  id: string
  title: string
  subtitle: string
  image: string
  duration: string
  category: string
  calories?: number
  tags?: string[]
  isPremium?: boolean
}

/**
 * Detailed Meal interface for detail view (mapped from Recipe)
 */
export interface MealDetail {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  duration: string
  category: string
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  ingredients: Ingredient[]
  instructions: string[]
  notes?: string
  comments: MealComment[]
  tags?: string[]
  isPremium: boolean
  difficulty?: string
}

export interface MealComment {
  id: string
  user: {
    name: string
    avatar: string
  }
  text: string
  date: string
  likes: number
}

/**
 * API Response types
 */
export interface MealsApiResponse {
  success: boolean
  data: Recipe[]
  pagination?: {
    page: number
    limit: number
    total: number | null
  }
  error?: string
}

export interface MealDetailApiResponse {
  success: boolean
  data: Recipe
  error?: string
}

/**
 * Transform Recipe from API to Meal for list view
 */
export function recipeToMeal(recipe: Recipe): Meal {
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
  
  return {
    id: recipe.recipe_id,
    title: recipe.recipe_name,
    subtitle: recipe.description || recipe.difficulty || 'Delicious recipe',
    image: recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    duration: totalTime > 0 ? `${totalTime} min` : '30 min',
    category: recipe.class_name || 'Other',
    calories: recipe.calories_per_serving || undefined,
    tags: recipe.tags || [],
    isPremium: recipe.is_premium,
  }
}

/**
 * Transform Recipe from API to MealDetail for detail view
 */
export function recipeToMealDetail(recipe: Recipe): MealDetail {
  const totalTime = (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
  
  return {
    id: recipe.recipe_id,
    title: recipe.recipe_name,
    subtitle: recipe.difficulty || 'Easy',
    description: recipe.description || 'A delicious and healthy recipe.',
    image: recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    duration: totalTime > 0 ? `${totalTime} min` : '30 min',
    category: recipe.class_name || 'Other',
    servings: recipe.servings || 4,
    calories: recipe.calories_per_serving || 0,
    protein: recipe.protein_grams || 0,
    carbs: recipe.carbs_grams || 0,
    fat: recipe.fat_grams || 0,
    fiber: recipe.fiber_grams || undefined,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    tags: recipe.tags || [],
    isPremium: recipe.is_premium,
    difficulty: recipe.difficulty || undefined,
    comments: [], // Comments would come from a separate API
  }
}

/**
 * Helper function to group meals by category
 */
export function groupMealsByCategory(meals: Meal[]): Record<string, Meal[]> {
  return meals.reduce((acc, meal) => {
    const category = meal.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(meal)
    return acc
  }, {} as Record<string, Meal[]>)
}

/**
 * Fetch meals from API
 */
export async function fetchMeals(options?: {
  category?: string
  search?: string
  limit?: number
  page?: number
  isPremium?: boolean
}): Promise<MealsApiResponse> {
  try {
    const params = new URLSearchParams()
    if (options?.category) params.set('category', options.category)
    if (options?.search) params.set('search', options.search)
    if (options?.limit) params.set('limit', options.limit.toString())
    if (options?.page) params.set('page', options.page.toString())
    if (options?.isPremium !== undefined) params.set('isPremium', options.isPremium.toString())

    const response = await fetch(`/api/users/meals?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch meals')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching meals:', error)
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Fetch single meal detail from API
 */
export async function fetchMealDetail(mealId: string): Promise<MealDetailApiResponse | null> {
  try {
    const response = await fetch(`/api/users/meals/${mealId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch meal details')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching meal detail:', error)
    return null
  }
}

// Mock data for development fallback - will be used if API fails

export const mockMeals: Meal[] = [
  // Breakfast
  {
    id: '1',
    title: 'Avocado Toast Bowl',
    subtitle: 'Healthy breakfast',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
    duration: '15 min',
    category: 'Breakfast',
    calories: 320,
  },
  {
    id: '2',
    title: 'Greek Yogurt Parfait',
    subtitle: 'Protein-rich start',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
    duration: '10 min',
    category: 'Breakfast',
    calories: 280,
  },
  {
    id: '3',
    title: 'Smoothie Bowl',
    subtitle: 'Fresh & energizing',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
    duration: '10 min',
    category: 'Breakfast',
    calories: 250,
  },
  // Dinner
  {
    id: '4',
    title: 'Grilled Salmon',
    subtitle: 'Omega-3 rich',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    duration: '30 min',
    category: 'Dinner',
    calories: 450,
  },
  {
    id: '5',
    title: 'Quinoa Buddha Bowl',
    subtitle: 'Plant-based protein',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    duration: '25 min',
    category: 'Dinner',
    calories: 380,
  },
  // Snacks
  {
    id: '6',
    title: 'No-Bake Chocolate Caramel Balls',
    subtitle: 'Energy bites',
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80',
    duration: '20 min',
    category: 'Snacks',
    calories: 150,
  },
  {
    id: '7',
    title: 'Mixed Nuts & Seeds',
    subtitle: 'Healthy fats',
    image: 'https://images.unsplash.com/photo-1536816579748-4ecb3f03d72a?w=800&q=80',
    duration: '5 min',
    category: 'Snacks',
    calories: 180,
  },
]

export const mockMealDetail: MealDetail = {
  id: '6',
  title: 'No-Bake Chocolate Caramel Balls',
  subtitle: 'Energy bites',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu euismod lorem, non facilisis elit. Nulla porta accumsan quam. Praesent eu euismod lorem, non facilisis elit.',
  image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&q=80',
  duration: '20 min',
  category: 'Snacks',
  servings: 12,
  calories: 150,
  protein: 4,
  carbs: 18,
  fat: 8,
  ingredients: [
    { name: 'Dates', amount: '1', unit: 'cup' },
    { name: 'Almonds', amount: '1/2', unit: 'cup' },
    { name: 'Cocoa powder', amount: '2', unit: 'tbsp' },
    { name: 'Coconut oil', amount: '1', unit: 'tbsp' },
    { name: 'Vanilla extract', amount: '1', unit: 'tsp' },
    { name: 'Sea salt', amount: '1/4', unit: 'tsp' },
  ],
  instructions: [
    'Soak dates in warm water for 10 minutes, then drain.',
    'Add dates, almonds, cocoa powder, coconut oil, vanilla, and salt to a food processor.',
    'Blend until mixture forms a sticky dough.',
    'Roll into 12 equal-sized balls using your hands.',
    'Place on a parchment-lined tray and refrigerate for at least 30 minutes.',
    'Store in an airtight container in the refrigerator for up to 1 week.',
  ],
  comments: [
    {
      id: '1',
      user: {
        name: 'Sarah M.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      },
      text: 'So delicious and easy to make!',
      date: '1d ago',
      likes: 5,
    },
    {
      id: '2',
      user: {
        name: 'Mike J.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      },
      text: 'Added some peanut butter - amazing!',
      date: '3d ago',
      likes: 3,
    },
  ],
  tags: ['Vegan', 'Gluten-free', 'No-bake'],
  isPremium: false,
}
