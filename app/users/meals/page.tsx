'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UserBottomNav } from '@/components/user-bottom-nav'
import { 
  mockMeals, 
  groupMealsByCategory, 
  fetchMeals, 
  recipeToMeal,
  type Meal 
} from '@/lib/types/meals'

export default function MealsPage() {
  const router = useRouter()
  const [meals, setMeals] = useState<Meal[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMeals()
  }, [])

  const loadMeals = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetchMeals({ limit: 50 })
      
      if (response.success && response.data.length > 0) {
        // Transform API recipes to Meal format
        const transformedMeals = response.data.map(recipeToMeal)
        setMeals(transformedMeals)
      } else {
        // Fallback to mock data if API returns empty or fails
        console.log('Using mock data as fallback')
        setMeals(mockMeals)
      }
    } catch (err) {
      console.error('Error loading meals:', err)
      setError('Failed to load meals')
      // Fallback to mock data on error
      setMeals(mockMeals)
    } finally {
      setIsLoading(false)
    }
  }

  const groupedMeals = useMemo(() => {
    const filtered = searchQuery
      ? meals.filter(meal => 
          meal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meal.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : meals
    return groupMealsByCategory(filtered)
  }, [meals, searchQuery])

  // Get unique categories from data, with preferred order
  const preferredOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Other']
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(meals.map(m => m.category))]
    return preferredOrder.filter(cat => uniqueCategories.includes(cat))
      .concat(uniqueCategories.filter(cat => !preferredOrder.includes(cat)))
  }, [meals])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
        <header className="px-4 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-[#333]">Meals</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#4A90E2]" />
            <p className="text-sm text-[#666]">Loading meals...</p>
          </div>
        </div>
        <UserBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-[#333]">Meals</h1>
        {error && (
          <p className="text-xs text-amber-600 mt-1">Using cached data</p>
        )}
      </header>

      {/* Search & Filter */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-full border border-gray-200 outline-none focus:border-[#4A90E2] transition-colors"
            />
          </div>
          <button className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-[#666]" />
          </button>
        </div>
      </div>

      {/* Meals Sections */}
      <main className="flex-1 px-4 md:px-8 pb-24 overflow-y-auto space-y-8">
        {categories.map(category => {
          const categoryMeals = groupedMeals[category] || []
          if (categoryMeals.length === 0) return null

          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#7B5A2F]">{category}</h2>
                <button className="text-sm text-[#4A90E2] hover:underline">View all</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoryMeals.map(meal => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onClick={() => router.push(`/users/meals/${meal.id}`)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </main>

      {/* Bottom Navigation */}
      <UserBottomNav />
    </div>
  )
}

function MealCard({
  meal,
  onClick,
}: {
  meal: Meal
  onClick: () => void
}) {
  return (
    <Card
      className="w-full rounded-2xl overflow-hidden border-none shadow-sm bg-white cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
      onClick={onClick}
    >
      <div
        className="h-32 sm:h-36 md:h-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${meal.image})` }}
      />
      <div className="p-3 sm:p-4 space-y-1.5">
        <h3 className="text-sm sm:text-base font-semibold text-[#333] line-clamp-1">{meal.title}</h3>
        <p className="text-xs sm:text-sm text-[#777] line-clamp-1">{meal.subtitle}</p>
        <div className="flex items-center gap-3 text-xs text-[#999] pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {meal.duration}
          </span>
          {meal.calories && (
            <span className="bg-[#F5F5F0] px-2 py-0.5 rounded-full">{meal.calories} cal</span>
          )}
        </div>
      </div>
    </Card>
  )
}
