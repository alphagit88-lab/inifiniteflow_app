'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, BookOpen, UtensilsCrossed, Activity, GraduationCap, Video, Settings } from 'lucide-react'

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'User Management', icon: Users },
    { href: '/instructors', label: 'Instructor Management', icon: GraduationCap },
    { href: '/classes', label: 'Class Management', icon: BookOpen },
    { href: '/recipes', label: 'Recipe Management', icon: UtensilsCrossed },
    { href: '/workout', label: 'Workout Management', icon: Activity },
    { href: '/dashboard/videos', label: 'Video Management', icon: Video },
    { href: '/dashboard/videos/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo/Brand */}
      <div className="flex items-center justify-center h-20 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href === '/dashboard/videos/settings' && pathname?.startsWith('/dashboard/videos/settings'))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <p className="text-xs text-sidebar-foreground/60">© 2025 Admin Portal</p>
      </div>
    </aside>
  )
}
