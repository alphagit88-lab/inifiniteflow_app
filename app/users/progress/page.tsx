'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { UserBottomNav } from '@/components/user-bottom-nav'
import { ChevronDown, Dumbbell, Utensils, BarChart2, Home } from 'lucide-react'
import { getCurrentUser, type User } from '@/lib/supabase/auth'

interface ProgressStats {
  period: string
  totalWorkouts: number
  totalMinutes: number
  totalCalories: number
  avgDifficulty: number
  streak: number
  weeklyGoal: number
  recentWorkouts: any[]
}

interface ClassItem {
  class_id: string
  class_name: string
  instructor_name?: string
  thumbnail_url?: string
  duration?: number
  level?: string
}

export default function ProgressPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [activityPeriod, setActivityPeriod] = useState<'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    loadData()
  }, [selectedPeriod])

  const loadData = async () => {
    try {
      const userData = await getCurrentUser()
      if (!userData) {
        router.push('/users/login')
        return
      }
      setUser(userData)

      // Fetch progress stats
      const progressRes = await fetch(`/api/users/progress?userId=${userData.uid}&period=${selectedPeriod}`)
      if (progressRes.ok) {
        const progressData = await progressRes.json()
        if (progressData.success) {
          setStats({
            ...progressData.data,
            weeklyGoal: 4 // Default weekly goal
          })
        }
      }

      // Fetch user's classes
      const classesRes = await fetch(`/api/users/classes?limit=5`)
      if (classesRes.ok) {
        const classesData = await classesRes.json()
        if (classesData.success) {
          setClasses(classesData.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <p className="text-[#666]">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.display_name || user.email?.split('@')[0] || 'User'
  const initials = displayName.substring(0, 2).toUpperCase()

  // Calculate workout progress percentage
  const weeklyGoal = stats?.weeklyGoal || 4
  const completedWorkouts = stats?.totalWorkouts || 0
  const workoutProgress = Math.min((completedWorkouts / weeklyGoal) * 100, 100)

  // Sample activity data for the week (would come from API in production)
  const activityData = [
    { day: 'Sun', value: 40 },
    { day: 'Mon', value: 60 },
    { day: 'Tue', value: 80 },
    { day: 'Wed', value: 55 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 70 },
    { day: 'Sat', value: 45 },
  ]

  // Metric calculation (consistency based on streak)
  const consistencyMetric = stats?.streak ? Math.min((stats.streak / 7) * 100, 100) : 80

  return (
    <div className="min-h-screen bg-[#F5F5F0] pb-24">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#333]">Progress</h1>
        <Avatar className="w-10 h-10 border-2 border-[#4A90E2] shadow-sm">
          <AvatarFallback className="bg-[#E8F0FE] text-[#4A90E2] font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </header>

      <div className="px-5 space-y-5">
        {/* Workout Progress Card */}
        <Card className="p-5 bg-white rounded-2xl shadow-sm border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#333]">Workout Progress</h2>
            <button className="flex items-center gap-1 text-xs text-[#666] bg-gray-100 px-3 py-1.5 rounded-full">
              {selectedPeriod === 'week' ? 'Today' : selectedPeriod === 'month' ? 'This Month' : 'This Year'}
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#666] mb-1">Weekly Progress</p>
              <p className="text-xs text-[#999]">{completedWorkouts} Completed</p>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#E5E5E5"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#FF6B35"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - workoutProgress / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[#333]">{Math.round(workoutProgress)}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Time Card */}
        <Card className="p-5 bg-white rounded-2xl shadow-sm border-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#333]">Activity Time</h2>
            <button className="flex items-center gap-1 text-xs text-[#666] bg-gray-100 px-3 py-1.5 rounded-full">
              {activityPeriod === 'weekly' ? 'Weekly' : 'Monthly'}
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-32 gap-2">
            {activityData.map((item, index) => (
              <div key={item.day} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-[#4A90E2] rounded-t-md transition-all duration-300"
                  style={{ 
                    height: `${item.value}%`,
                    opacity: item.value > 70 ? 1 : item.value > 40 ? 0.7 : 0.4
                  }}
                />
                <span className="text-[10px] text-[#999] mt-2">{item.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Some Metric Card */}
        <Card className="p-5 bg-white rounded-2xl shadow-sm border-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[#333]">Some Metric</h3>
              <p className="text-xs text-[#999]">progress measure</p>
            </div>
            
            {/* Semi-circular Progress */}
            <div className="relative w-16 h-10">
              <svg className="w-16 h-10" viewBox="0 0 64 40">
                <path
                  d="M 4 36 A 28 28 0 0 1 60 36"
                  stroke="#E5E5E5"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 4 36 A 28 28 0 0 1 60 36"
                  stroke="#7B8B6F"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="88"
                  strokeDashoffset={`${88 * (1 - consistencyMetric / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center mt-2">
                <span className="text-sm font-bold text-[#333]">{Math.round(consistencyMetric)}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* My Classes Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-[#333]">My Classes</h2>
            <button 
              onClick={() => router.push('/users/workout')}
              className="text-xs text-[#4A90E2] font-medium"
            >
              See more
            </button>
          </div>

          <div className="space-y-3">
            {classes.length > 0 ? (
              classes.slice(0, 3).map((classItem) => (
                <Card 
                  key={classItem.class_id} 
                  className="p-3 bg-white rounded-xl shadow-sm border-0 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/users/workout/${classItem.class_id}`)}
                >
                  <div className="w-12 h-12 bg-[#E8F0FE] rounded-lg flex items-center justify-center shrink-0">
                    {classItem.thumbnail_url ? (
                      <img 
                        src={classItem.thumbnail_url} 
                        alt={classItem.class_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Dumbbell className="w-5 h-5 text-[#4A90E2]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#333] truncate">{classItem.class_name}</p>
                    <p className="text-xs text-[#999]">
                      {classItem.level || 'All Levels'} • {classItem.duration || 30} min
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-[#4A90E2] rounded-full" />
                </Card>
              ))
            ) : (
              <>
                <Card className="p-3 bg-white rounded-xl shadow-sm border-0 flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E8F0FE] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#4A90E2]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333]">Beginner Pilate Class</p>
                    <p className="text-xs text-[#999]">All Levels • 30 min</p>
                  </div>
                  <div className="w-2 h-2 bg-[#4A90E2] rounded-full" />
                </Card>
                <Card className="p-3 bg-white rounded-xl shadow-sm border-0 flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333]">Abs Workout Class</p>
                    <p className="text-xs text-[#999]">Intermediate • 25 min</p>
                  </div>
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full" />
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <UserBottomNav />
    </div>
  )
}
