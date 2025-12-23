'use client'

import { UserLayout } from '@/components/user-layout'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/supabaseClient'
import { useEffect, useState } from 'react'
import { Activity, Heart, Target, Calendar } from 'lucide-react'
import type { FullProfile } from '@/actions/profiles'

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setProfile(data as FullProfile)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
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

  return (
    <UserLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#FF6B35] mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-[#666]">Welcome to your fitness journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 md:p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-[#666]">Activity Level</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-[#333]">{profile?.activity_level || 'N/A'}</p>
              </div>
              <Activity className="h-6 w-6 md:h-8 md:w-8 text-[#4A90E2]" />
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-[#666]">Dietary Preference</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-[#333]">{profile?.dietary_preference || 'N/A'}</p>
              </div>
              <Heart className="h-6 w-6 md:h-8 md:w-8 text-[#4A90E2]" />
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-[#666]">Subscription</p>
                <p className="text-xl md:text-2xl font-bold mt-1 capitalize text-[#333]">{profile?.subscription_status || 'N/A'}</p>
              </div>
              <Target className="h-6 w-6 md:h-8 md:w-8 text-[#4A90E2]" />
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-[#666]">Member Since</p>
                <p className="text-xl md:text-2xl font-bold mt-1 text-[#333]">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
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
              <p className="text-xs md:text-sm text-[#666]">Name</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {profile?.first_name} {profile?.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Nickname</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">{profile?.nickname}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Email</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">{profile?.email}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Date of Birth</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {profile?.date_of_birth 
                  ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { 
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
                {profile?.height} {profile?.height_unit}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Weight</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {profile?.weight} {profile?.weight_unit}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Gender</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">{profile?.gender}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-[#666]">Allergies</p>
              <p className="text-base md:text-lg font-medium mt-1 text-[#333]">
                {profile?.allergies && profile.allergies.length > 0 
                  ? profile.allergies.join(', ') 
                  : 'None'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </UserLayout>
  )
}

