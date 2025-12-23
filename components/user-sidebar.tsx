'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function UserSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/users/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users/profile', label: 'Profile', icon: User },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/users/login')
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col z-10">
      {/* Logo/Brand */}
      <div className="flex items-center justify-center h-16 md:h-20 border-b border-gray-200">
        <h1 className="text-lg md:text-xl font-bold text-[#FF6B35]">User Portal</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#FF6B35] text-white'
                  : 'text-[#333] hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer with Sign Out */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-2">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start text-[#333] hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
        <p className="text-xs text-[#666]">© 2025 User Portal</p>
      </div>
    </aside>
  )
}

