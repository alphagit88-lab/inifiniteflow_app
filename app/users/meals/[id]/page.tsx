'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ChevronLeft, 
  Heart, 
  Share2, 
  Bookmark, 
  Clock,
  Users,
  Flame,
  Loader2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserBottomNav } from '@/components/user-bottom-nav'
import { 
  mockMealDetail, 
  fetchMealDetail, 
  recipeToMealDetail,
  type MealDetail 
} from '@/lib/types/meals'

export default function MealDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [meal, setMeal] = useState<MealDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'comments' | 'notes'>('comments')
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    loadMealDetail()
  }, [params.id])

  const loadMealDetail = async () => {
    setIsLoading(true)
    
    try {
      const mealId = params.id as string
      const response = await fetchMealDetail(mealId)
      
      if (response?.success && response.data) {
        const transformedMeal = recipeToMealDetail(response.data)
        setMeal(transformedMeal)
      } else {
        // Fallback to mock data if API fails
        console.log('Using mock data as fallback')
        setMeal(mockMealDetail)
      }
    } catch (err) {
      console.error('Error loading meal detail:', err)
      // Fallback to mock data on error
      setMeal(mockMealDetail)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#4A90E2]" />
            <p className="text-sm text-[#666]">Loading meal details...</p>
          </div>
        </div>
        <UserBottomNav />
      </div>
    )
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#666] mb-4">Meal not found</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
        <UserBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Hero Image Section */}
      <div className="relative">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[#333]" />
        </button>

        {/* Image */}
        <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 bg-gray-200">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${meal.image})` }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />

          {/* Action Icons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-[#666]'}`} />
            </button>
            <button className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
              <Share2 className="w-5 h-5 text-[#666]" />
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'text-[#4A90E2] fill-[#4A90E2]' : 'text-[#666]'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="flex-1 px-4 md:px-8 lg:px-12 py-6 pb-24 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Title & Tags */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#333]">{meal.title}</h1>
            {meal.tags && meal.tags.length > 0 && (
              <div className="flex gap-2 mt-3">
                {meal.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="text-xs px-3 py-1 rounded-full bg-[#E8F4E8] text-[#4A7C4A]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <Card className="rounded-xl border-none shadow-sm bg-white p-5 md:p-6 mb-5">
            <div className="flex justify-between md:justify-start md:gap-16">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#4A90E2]" />
                <div>
                  <p className="text-xs md:text-sm text-[#999]">Time</p>
                  <p className="text-base md:text-lg font-medium text-[#333]">{meal.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#4A90E2]" />
                <div>
                  <p className="text-xs md:text-sm text-[#999]">Servings</p>
                  <p className="text-base md:text-lg font-medium text-[#333]">{meal.servings}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-[#4A90E2]" />
                <div>
                  <p className="text-xs md:text-sm text-[#999]">Calories</p>
                  <p className="text-base md:text-lg font-medium text-[#333]">{meal.calories}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="rounded-xl border-none shadow-sm bg-white p-5 md:p-6 mb-5">
            <p className="text-sm md:text-base text-[#666] leading-relaxed">{meal.description}</p>
          </Card>

          {/* Two Column Layout for larger screens */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Nutrition Info */}
            <Card className="rounded-xl border-none shadow-sm bg-white p-5 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-[#333] mb-4">Nutrition per serving</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F5F5F0] rounded-lg p-3 text-center">
                  <p className="text-lg md:text-xl font-semibold text-[#333]">{meal.calories}</p>
                  <p className="text-xs md:text-sm text-[#999]">Calories</p>
                </div>
                <div className="bg-[#F5F5F0] rounded-lg p-3 text-center">
                  <p className="text-lg md:text-xl font-semibold text-[#333]">{meal.protein}g</p>
                  <p className="text-xs md:text-sm text-[#999]">Protein</p>
                </div>
                <div className="bg-[#F5F5F0] rounded-lg p-3 text-center">
                  <p className="text-lg md:text-xl font-semibold text-[#333]">{meal.carbs}g</p>
                  <p className="text-xs md:text-sm text-[#999]">Carbs</p>
                </div>
                <div className="bg-[#F5F5F0] rounded-lg p-3 text-center">
                  <p className="text-lg md:text-xl font-semibold text-[#333]">{meal.fat}g</p>
                  <p className="text-xs md:text-sm text-[#999]">Fat</p>
                </div>
              </div>
            </Card>

            {/* Ingredients */}
            <Card className="rounded-xl border-none shadow-sm bg-white p-5 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-[#333] mb-4">Ingredients</h3>
              <ul className="space-y-3">
                {meal.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm md:text-base">
                    <span className="text-[#333]">{ingredient.name}</span>
                    <span className="text-[#999]">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="rounded-xl border-none shadow-sm bg-white p-5 md:p-6 mt-5">
            <h3 className="text-base md:text-lg font-semibold text-[#333] mb-4">Instructions</h3>
            <ol className="space-y-4">
              {meal.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-4 text-sm md:text-base">
                  <span className="w-7 h-7 shrink-0 bg-[#4A90E2] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </span>
                  <span className="text-[#666] leading-relaxed pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* Notes */}
          {meal.notes && (
            <Card className="rounded-xl border-none shadow-sm bg-white p-5 md:p-6 mt-5">
              <h3 className="text-base md:text-lg font-semibold text-[#333] mb-3">Tips</h3>
              <p className="text-sm md:text-base text-[#666] leading-relaxed">{meal.notes}</p>
            </Card>
          )}

          {/* Comments Section */}
          <Card className="rounded-xl border-none shadow-sm bg-white p-5 md:p-6 mt-5">
            <h3 className="text-base md:text-lg font-semibold text-[#333] mb-4">Comments</h3>
            
            {/* Comment Input */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
              <input
                type="text"
                placeholder="Add a comment"
                className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {meal.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#333]">{comment.user.name}</span>
                      <span className="text-xs text-[#999]">{comment.date}</span>
                    </div>
                    {comment.text && (
                      <p className="text-sm text-[#666] mt-1">{comment.text}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#999]">
                    <Heart className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <UserBottomNav />
    </div>
  )
}
