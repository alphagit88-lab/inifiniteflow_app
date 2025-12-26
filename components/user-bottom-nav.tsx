'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, Dumbbell, Utensils, User2, BarChart2 } from 'lucide-react'

interface NavItemProps {
  label: string
  icon: React.ReactNode
  href: string
  active?: boolean
}

function NavItem({ label, icon, href, active }: NavItemProps) {
  const router = useRouter()
  
  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className={`flex flex-col items-center gap-0.5 transition-colors ${
        active ? 'text-[#4A90E2]' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

export function UserBottomNav() {
  const pathname = usePathname()
  
  const isActive = (path: string) => {
    if (path === '/users/home') {
      return pathname === '/users/home'
    }
    return pathname?.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto text-[10px]">
        <NavItem 
          label="Home" 
          icon={<Home className="w-5 h-5" />} 
          href="/users/home"
          active={isActive('/users/home')}
        />
        <NavItem 
          label="Classes" 
          icon={<Dumbbell className="w-5 h-5" />} 
          href="/users/workout"
          active={isActive('/users/workout')}
        />
        <NavItem 
          label="Meals" 
          icon={<Utensils className="w-5 h-5" />} 
          href="/users/meals"
          active={isActive('/users/meals')}
        />
        <NavItem 
          label="Progress" 
          icon={<BarChart2 className="w-5 h-5" />} 
          href="/users/progress"
          active={isActive('/users/progress')}
        />
        <NavItem 
          label="Profile" 
          icon={<User2 className="w-5 h-5" />} 
          href="/users/profile"
          active={isActive('/users/profile')}
        />
      </div>
    </nav>
  )
}
