'use client'

import { useRouter } from 'next/navigation'
import { UserLayout } from '@/components/user-layout'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Activity, Heart, Target, Calendar } from 'lucide-react'
import { getCurrentUser, type User } from '@/lib/supabase/auth'

export default function UserDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser()
      
      if (!userData) {
        router.push('/users/login')
        return
      }

      setUser(userData)
    } catch (err) {
      console.error('Error loading user:', err)
      router.push('/users/login')
    }
    
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <UserLayout>
        <div className="text-[#666]">Loading dashboard...</div>
      </UserLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <UserLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#FF6B35] mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-[#666]">Welcome back, {user.display_name || 'User'}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 md:p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-[#666]">Activity Level</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-[#333]">{user.activity_level || 'N/A'}</p>
              </div>
              <Activity className="h-6 w-6 md:h-8 md:w-8 text-[#4A90E2]" />
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-[#666]">Dietary Preference</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-[#333]">{user.dietary_preference || 'N/A'}</p>
              </div>
              <Heart className="h-6 w-6 md:h-8 md:w-8 text-[#4A90E2]" />
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-[#666]">Provider</p>
                <p className="text-xl md:text-2xl font-bold mt-1 capitalize text-[#333]">{user.provider || 'N/A'}</p>
              </div>
              <Target className="h-6 w-6 md:h-8 md:w-8 text-[#4A90E2]" />
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-[#666]">Member Since</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-[#333]">
                  {user.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'N/A'}
                </p>
              </div>
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-[#4A90E2]" />
            </div>
          </Card>
        </div>

        {/* Profile Summary */}
        <Card className="p-4 md:p-6 bg-white border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-[#FF6B35]">Profile Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs md:text-sm text-[#666]">Display Name</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {user.display_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Email</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">{user.email}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Phone</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">{user.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Date of Birth</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {user.date_of_birth 
                  ? new Date(user.date_of_birth).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Height</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {user.height ? `${user.height} ${user.height_unit || 'cm'}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Weight</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {user.weight ? `${user.weight} ${user.weight_unit || 'kg'}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Gender</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">{user.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Last Sign In</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </UserLayout>
  )
}

