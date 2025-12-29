'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { UserLayout } from '@/components/user-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import type { FullProfile } from '@/actions/profiles'

export default function ProfilePage() {
  const [profile, setProfile] = useState<FullProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        setIsLoading(false)
        return
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setError('Failed to load profile: ' + profileError.message)
      } else if (data) {
        setProfile(data as FullProfile)
      } else {
        setError('Profile not found')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
    
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        setIsSaving(false)
        return
      }

      const updateData = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        nickname: profile.nickname,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        height: profile.height,
        height_unit: profile.height_unit,
        weight: profile.weight,
        weight_unit: profile.weight_unit,
        activity_level: profile.activity_level,
        dietary_preference: profile.dietary_preference,
        allergies: profile.allergies,
        profile_picture: profile.profile_picture,
        updated_at: new Date().toISOString(),
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating profile:', updateError)
        setError('Failed to update profile: ' + updateError.message)
      } else if (data) {
        setProfile(data as FullProfile)
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }

    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <UserLayout>
        <div className="text-[#666]">Loading profile...</div>
      </UserLayout>
    )
  }

  if (!profile) {
    return (
      <UserLayout>
        <div className="text-red-600">{error || 'Failed to load profile'}</div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#FF6B35] mb-2">My Profile</h1>
          <p className="text-sm md:text-base text-[#666]">Manage your account information</p>
        </div>

        <Card className="p-4 md:p-6 bg-white border-gray-200">
          {/* Messages */}
          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#333] text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-100 border-gray-300 rounded-lg h-12 text-[#666]"
              />
              <p className="text-xs text-[#666]">Email cannot be changed</p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-[#333] text-sm font-medium">First Name *</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  required
                  disabled={isSaving}
                  className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-[#333] text-sm font-medium">Last Name *</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  required
                  disabled={isSaving}
                  className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-[#333] text-sm font-medium">Nickname *</Label>
                <Input
                  id="nickname"
                  type="text"
                  value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  required
                  disabled={isSaving}
                  className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-[#333] text-sm font-medium">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profile.date_of_birth}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  required
                  disabled={isSaving}
                  max={new Date().toISOString().split('T')[0]}
                  className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-[#333] text-sm font-medium">Gender *</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  disabled={isSaving}
                  required
                >
                  <SelectTrigger id="gender" className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Height and Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height" className="text-[#333] text-sm font-medium">Height *</Label>
                <div className="flex gap-2">
                  <Input
                    id="height"
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || 0 })}
                    required
                    disabled={isSaving}
                    min="0"
                    step="0.1"
                    className="flex-1 bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <Select
                    value={profile.height_unit}
                    onValueChange={(value) => setProfile({ ...profile, height_unit: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-20 md:w-24 bg-white border-gray-300 rounded-lg h-12 text-[#333]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-[#333] text-sm font-medium">Weight *</Label>
                <div className="flex gap-2">
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight || ''}
                    onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })}
                    required
                    disabled={isSaving}
                    min="0"
                    step="0.1"
                    className="flex-1 bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <Select
                    value={profile.weight_unit}
                    onValueChange={(value) => setProfile({ ...profile, weight_unit: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger className="w-20 md:w-24 bg-white border-gray-300 rounded-lg h-12 text-[#333]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="lb">lb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Activity Level and Dietary Preference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="activity_level" className="text-[#333] text-sm font-medium">Activity Level *</Label>
                <Select
                  value={profile.activity_level}
                  onValueChange={(value) => setProfile({ ...profile, activity_level: value })}
                  disabled={isSaving}
                  required
                >
                  <SelectTrigger id="activity_level" className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                    <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                    <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                    <SelectItem value="Very Active">Very Active</SelectItem>
                    <SelectItem value="Extremely Active">Extremely Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dietary_preference" className="text-[#333] text-sm font-medium">Dietary Preference *</Label>
                <Select
                  value={profile.dietary_preference}
                  onValueChange={(value) => setProfile({ ...profile, dietary_preference: value })}
                  disabled={isSaving}
                  required
                >
                  <SelectTrigger id="dietary_preference" className="bg-white border-gray-300 rounded-lg h-12 text-[#333] focus:border-[#FF6B35]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Omnivore">Omnivore</SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                    <SelectItem value="Pescatarian">Pescatarian</SelectItem>
                    <SelectItem value="Keto">Keto</SelectItem>
                    <SelectItem value="Paleo">Paleo</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subscription Info (read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <Label className="text-[#333] text-sm font-medium">Subscription Plan</Label>
                <Input
                  value={`Plan ${profile.subscription_plan}`}
                  disabled
                  className="bg-gray-100 border-gray-300 rounded-lg h-12 text-[#666]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#333] text-sm font-medium">Subscription Status</Label>
                <Input
                  value={profile.subscription_status}
                  disabled
                  className="bg-gray-100 border-gray-300 rounded-lg h-12 text-[#666]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="h-12 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-medium rounded-lg px-6"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </UserLayout>
  )
}

