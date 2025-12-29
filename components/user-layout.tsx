'use client'

import { UserSidebar } from './user-sidebar'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabaseClient'

interface UserLayoutProps {
  children: React.ReactNode
}

export function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState<string>('User')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/users/login')
        return
      }

      // Verify user_type = 'S'
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, first_name, nickname')
        .eq('user_id', user.id)
        .single()

      if (profileError || !profile || profile.user_type !== 'S') {
        await supabase.auth.signOut()
        router.push('/users/login')
        return
      }

      // Set user name for header
      setUserName(profile.nickname || profile.first_name || 'User')
      setIsLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/users/login')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#F5F5F0] items-center justify-center">
        <div className="text-[#666]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F5F5F0]">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white h-16 md:h-20 flex items-center px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#FF6B35]">Welcome, {userName}!</h2>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

