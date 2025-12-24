'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { PlayCircle, BarChart2, Dumbbell, Utensils, User2 } from 'lucide-react'

type HomeMode = 'firstTime' | 'regular'

export default function HomePage() {
  const [mode, setMode] = useState<HomeMode>('firstTime')

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Mode toggle for design preview only */}
      <div className="px-4 pt-4 flex justify-center gap-2 text-xs">
        <Button
          type="button"
          size="sm"
          variant={mode === 'firstTime' ? 'default' : 'outline'}
          className={
            mode === 'firstTime'
              ? 'bg-[#4A90E2] hover:bg-[#3A7BC8] text-white rounded-full h-7 px-4'
              : 'rounded-full h-7 px-4 border-[#D3C7B8] text-[#7B5A2F]'
          }
          onClick={() => setMode('firstTime')}
        >
          First Time User
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'regular' ? 'default' : 'outline'}
          className={
            mode === 'regular'
              ? 'bg-[#4A90E2] hover:bg-[#3A7BC8] text-white rounded-full h-7 px-4'
              : 'rounded-full h-7 px-4 border-[#D3C7B8] text-[#7B5A2F]'
          }
          onClick={() => setMode('regular')}
        >
          Regular User
        </Button>
      </div>

      {mode === 'firstTime' ? <FirstTimeHome /> : <RegularHome />}
    </div>
  )
}

function HomeShell({
  greeting,
  subtitle,
  showProgress = false,
}: {
  greeting: string
  subtitle: string
  showProgress?: boolean
}) {
  return (
    <>
      {/* Top hero header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <InfinityLogo className="w-7 h-7 text-[#FF6B35]" />
          </div>
          <div>
            <p className="text-xs text-[#999]">Hello, Clara</p>
            <p className="text-sm font-semibold text-[#333]">{greeting}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-[#7B5A2F] text-sm">🔍</button>
          <button className="text-[#7B5A2F] text-sm">🔔</button>
          <Avatar className="w-9 h-9 border border-[#F3E5D8] shadow-sm">
            <AvatarImage src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80" />
            <AvatarFallback>CL</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Optional progress summary for regular users */}
      {showProgress && (
        <section className="px-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-[#7B5A2F]">Measure your progress</p>
          </div>
          <div className="flex gap-3">
            <ProgressBadge label="Workouts" value="25%" />
            <ProgressBadge label="Consistency" value="71%" />
            <ProgressBadge label="Energy" value="Good" />
          </div>
        </section>
      )}

      {/* Subtitle */}
      <p className="px-4 text-[11px] text-[#999] mb-2">{subtitle}</p>
    </>
  )
}

function FirstTimeHome() {
  return (
    <>
      <HomeShell
        greeting="Welcome to your Pilates journey"
        subtitle="First time user gets a welcoming card introducing the program."
      />

      <main className="flex-1 overflow-y-auto px-4 pb-20 space-y-6">
        {/* Explore Classes */}
        <SectionHeader title="Explore Classes" />
        <HorizontalCards>
          <ClassHeroCard />
          <SmallClassCard title="Gentle Start" tag="Beginner" />
          <SmallClassCard title="Core Awakening" tag="Beginner" />
        </HorizontalCards>

        {/* My Next Workout */}
        <SectionHeader title="My Next Workout" />
        <WorkoutPreview />

        {/* Meet your Trainer */}
        <SectionHeader title="Meet your Trainer" />
        <TrainerHeroCard />

        {/* Today's Meal Plan */}
        <TodaysMealPlan />
      </main>

      <BottomNav />
    </>
  )
}

function RegularHome() {
  return (
    <>
      <HomeShell
        greeting="You are doing great! Keep it up ✨"
        subtitle="Regular user can find their next workout and meal plans ready on the home page."
        showProgress
      />

      <main className="flex-1 overflow-y-auto px-4 pb-20 space-y-6">
        {/* My Next Workout */}
        <SectionHeader title="My Next Workout" />
        <WorkoutPreview />

        {/* My Classes */}
        <SectionHeader title="My Classes" />
        <HorizontalCards>
          <SmallClassCard title="Morning Flow" tag="In Progress" />
          <SmallClassCard title="Evening Stretch" tag="Queued" />
        </HorizontalCards>

        {/* Today's Meal Plan */}
        <TodaysMealPlan />

        {/* Meet your Trainer */}
        <SectionHeader title="Meet your Trainer" />
        <TrainerHeroCard />
      </main>

      <BottomNav />
    </>
  )
}

function InfinityLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 30"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 15C15 8.37258 20.3726 3 27 3C33.6274 3 39 8.37258 39 15C39 21.6274 33.6274 27 27 27C20.3726 27 15 21.6274 15 15Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M45 15C45 8.37258 50.3726 3 57 3C63.6274 3 69 8.37258 69 15C69 21.6274 63.6274 27 57 27C50.3726 27 45 21.6274 45 15Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        transform="translate(-30, 0)"
      />
      <circle cx="24" cy="15" r="2" fill="currentColor" />
      <circle cx="36" cy="15" r="2" fill="currentColor" />
    </svg>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-[#7B5A2F]">{title}</p>
      <button className="text-[10px] text-[#4A90E2]">View all</button>
    </div>
  )
}

function HorizontalCards({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 mt-2">
      {children}
    </div>
  )
}

function ClassHeroCard() {
  return (
    <Card className="w-64 shrink-0 rounded-2xl overflow-hidden border-none shadow-md bg-gray-900 text-white relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1554344058-8d1d1dbc5960?w=800&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="relative z-10 p-4 flex flex-col justify-between h-40">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1">
            Step by Step
          </p>
          <h3 className="text-base font-semibold leading-snug">
            Class Name goes here on two lines
          </h3>
          <p className="text-[11px] text-white/75 mt-1">Subtitle text goes here long long</p>
        </div>
        <div className="flex items-center justify-between text-[10px] mt-2">
          <span className="px-2 py-0.5 rounded-full bg-white/20 border border-white/30">
            Beginner • 20 min
          </span>
          <span className="flex items-center gap-1">
            <PlayCircle className="w-4 h-4" /> Start
          </span>
        </div>
      </div>
    </Card>
  )
}

function SmallClassCard({ title, tag }: { title: string; tag: string }) {
  return (
    <Card className="w-40 shrink-0 rounded-2xl overflow-hidden border-none shadow-sm bg-white">
      <div
        className="h-24 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80)',
        }}
      />
      <div className="p-3 space-y-1">
        <p className="text-xs text-[#999]">Step by Step</p>
        <h3 className="text-sm font-semibold text-[#333] line-clamp-1">{title}</h3>
        <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1]">
          {tag}
        </span>
      </div>
    </Card>
  )
}

function WorkoutPreview() {
  return (
    <Card className="mt-2 rounded-2xl overflow-hidden border-none shadow-md bg-gray-900 text-white relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
      <div className="relative z-10 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1">
            My Next Workout
          </p>
          <h3 className="text-sm font-semibold leading-snug">Full Body Flow · Day 3</h3>
          <p className="text-[11px] text-white/70 mt-1">25 min · Intermediate</p>
        </div>
        <Button className="rounded-full bg-white text-[#333] h-9 px-4 text-xs font-semibold">
          Continue
        </Button>
      </div>
    </Card>
  )
}

function TrainerHeroCard() {
  return (
    <Card className="mt-2 rounded-2xl overflow-hidden border-none shadow-md bg-gray-900 text-white relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="relative z-10 p-4 flex flex-col justify-end h-44">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1">
          Meet your Trainer
        </p>
        <h3 className="text-sm font-semibold leading-snug">
          Today, Clara will take you into the next step
        </h3>
      </div>
    </Card>
  )
}

function MealCard({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  return (
    <Card className="w-36 shrink-0 rounded-2xl overflow-hidden border-none shadow-sm bg-white">
      <div
        className="h-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-[#333] line-clamp-1">{title}</h3>
        <p className="text-[11px] text-[#777] line-clamp-1">{subtitle}</p>
      </div>
    </Card>
  )
}

function TodaysMealPlan() {
  return (
    <section className="space-y-2">
      <SectionHeader title="Today's Meal Plan" />
      <div className="flex gap-3 overflow-x-auto pb-1">
        <MealCard
          title="Breakfast"
          subtitle="Avocado toast bowl"
          image="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80"
        />
        <MealCard
          title="Lunch"
          subtitle="Colorful nourish bowl"
          image="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80"
        />
        <MealCard
          title="Snack"
          subtitle="Mini energy bites"
          image="https://images.unsplash.com/photo-1514996937319-344454492b37?w=600&q=80"
        />
      </div>
    </section>
  )
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2">
      <div className="flex justify-between items-center max-w-md mx-auto text-[10px]">
        <NavItem label="Home" icon={<PlayCircle className="w-5 h-5" />} active />
        <NavItem label="Workout" icon={<Dumbbell className="w-5 h-5" />} />
        <NavItem label="Meals" icon={<Utensils className="w-5 h-5" />} />
        <NavItem label="Profile" icon={<User2 className="w-5 h-5" />} />
      </div>
    </nav>
  )
}

function NavItem({
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

function ProgressBadge({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex-1 rounded-xl border-none shadow-sm bg-white px-3 py-2 flex flex-col justify-between">
      <p className="text-[10px] text-[#999]">{label}</p>
      <div className="flex items-center gap-1 mt-1">
        <BarChart2 className="w-3 h-3 text-[#4A90E2]" />
        <span className="text-xs font-semibold text-[#333]">{value}</span>
      </div>
    </Card>
  )
}


