'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, LogOut, Home, Dumbbell, Utensils, BarChart2 } from 'lucide-react'

export default function MobileProfilePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between">
        <button type="button" className="flex items-center text-[#7B5A2F] text-sm gap-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-sm font-semibold text-[#333]">Profile</h1>
        <button type="button" className="flex items-center text-xs text-[#4A90E2] gap-1">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pb-20 space-y-4">
        {/* Weight goal card */}
        <Card className="rounded-2xl border-none bg-[#FFFDF8] shadow-sm px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#999]">Weight Goal</p>
            <p className="text-[11px] text-[#C9A26A]">2 kg to lose</p>
          </div>
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#F0E0CC]" />
            <div className="absolute inset-1 rounded-full border-2 border-[#4A90E2] border-t-transparent rotate-[-45deg]" />
            <div className="absolute inset-2 flex items-center justify-center">
              <span className="text-xs font-semibold text-[#333]">25%</span>
            </div>
          </div>
        </Card>

        {/* Main profile card */}
        <Card className="rounded-2xl border-none bg-[#FFFDF8] shadow-sm px-4 py-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] text-[#999]">Nick Name</p>
            <p className="text-sm font-semibold text-[#333]">Clara</p>
            <div className="flex gap-4 mt-2 text-[11px] text-[#777]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9A26A]">Age</p>
                <p>27</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9A26A]">Gender</p>
                <p>Female</p>
              </div>
            </div>
          </div>
          <Avatar className="w-16 h-16 border border-[#F3E5D8] shadow-sm">
            <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80" />
            <AvatarFallback>CL</AvatarFallback>
          </Avatar>
        </Card>

        {/* Secondary info card */}
        <Card className="rounded-2xl border-none bg-[#FFFDF8] shadow-sm px-4 py-3 space-y-2">
          <div className="flex justify-between text-[11px] text-[#777]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9A26A]">Nick Name</p>
              <p>Clara</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9A26A]">Age</p>
              <p>27</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#C9A26A]">Gender</p>
              <p>Female</p>
            </div>
          </div>
        </Card>
      </main>

      {/* Bottom nav (visual only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex justify-between items-center max-w-md mx-auto text-[10px]">
          <BottomNavItem label="Home" icon={<Home className="w-5 h-5" />} />
          <BottomNavItem label="Classes" icon={<Dumbbell className="w-5 h-5" />} />
          <BottomNavItem label="Meals" icon={<Utensils className="w-5 h-5" />} />
          <BottomNavItem label="Progress" icon={<BarChart2 className="w-5 h-5" />} active />
        </div>
      </nav>
    </div>
  )
}

function BottomNavItem({
  label,
  icon,
  active,
}: {
  label: string
  icon: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-0.5 ${
        active ? 'text-[#4A90E2]' : 'text-gray-500'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}


