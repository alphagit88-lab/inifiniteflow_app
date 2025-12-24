'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlayCircle, Dumbbell, Utensils, User2 } from 'lucide-react'

type ScreenStep = 0 | 1 | 2

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<ScreenStep>(0)

  // Simple timed transitions for the first two loading screens
  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => setStep(1), 1300)
      return () => clearTimeout(timer)
    }
    if (step === 1) {
      const timer = setTimeout(() => setStep(2), 1300)
      return () => clearTimeout(timer)
    }
  }, [step])

  const handleGetStarted = () => {
    router.push('/users/dashboard')
  }

  // Splash 1 – solid brand color with logo
  if (step === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#4A90E2]">
        <div className="flex flex-col items-center gap-4">
          <InfinityLogo className="w-16 h-16 text-white" />
        </div>
      </div>
    )
  }

  // Splash 2 – hero image with logo + title
  if (step === 1) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black/70" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <InfinityLogo className="w-16 h-16 text-white mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide text-center">
            Infinite Flow
          </h1>
          <p className="text-sm md:text-base text-white/90 mb-8 text-center">
            by Martyna Kondratowicz
          </p>
        </div>
      </div>
    )
  }

  // Step 3 – main onboarding home content
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0]">
      {/* Hero / Header */}
      <div className="relative h-[320px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black/70" />

        <div className="relative z-10 h-full flex flex-col justify-between px-6 pt-10 pb-6">
          {/* Top right icons placeholder */}
          <div className="flex justify-end gap-3 text-white/90 text-sm">
            <button className="rounded-full bg-black/30 px-3 py-1 backdrop-blur-sm border border-white/20">
              Help
            </button>
          </div>

          {/* Title + CTA */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Infinite Flow</h1>
            <p className="text-xs text-white/90 mb-4">by Martyna Kondratowicz</p>
            <p className="text-sm text-white/90 max-w-xs mb-4">
              Step-by-step workouts and nourishing meals to guide your wellness journey.
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-semibold rounded-full px-6 h-10"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 pt-4 space-y-8">
        {/* Step By Step section */}
        <SectionHeader title="Step By Step" badge="New" />
        <HorizontalCardRow>
          <StepCard
            title="Step 1 · Align"
            subtitle="Gentle warm-up"
            minutes={15}
            imageUrl="https://images.unsplash.com/photo-1554344058-8d1d1dbc5960?w=600&q=80"
          />
          <StepCard
            title="Step 2 · Activate"
            subtitle="Full body flow"
            minutes={25}
            imageUrl="https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80"
          />
          <StepCard
            title="Step 3 · Restore"
            subtitle="Cooling stretch"
            minutes={10}
            imageUrl="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80"
          />
        </HorizontalCardRow>

        {/* Explore Classes */}
        <SectionHeader title="Explore Classes" />
        <HorizontalCardRow>
          <ClassCard
            title="Morning Flow"
            subtitle="Wake up your body"
            tag="Beginner"
            imageUrl="https://images.unsplash.com/photo-1554344058-8d1d1dbc5960?w=600&q=80"
          />
          <ClassCard
            title="Core Strength"
            subtitle="Build strong foundation"
            tag="Intermediate"
            imageUrl="https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80"
          />
        </HorizontalCardRow>

        {/* Explore Healthy Meals */}
        <SectionHeader title="Explore Healthy Meals" />
        <HorizontalCardRow>
          <MealCard
            title="Snacks"
            subtitle="Mini energy bites"
            imageUrl="https://images.unsplash.com/photo-1514996937319-344454492b37?w=600&q=80"
          />
          <MealCard
            title="Dinner"
            subtitle="Colorful nourish bowl"
            imageUrl="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80"
          />
        </HorizontalCardRow>

        {/* Meet your Trainer */}
        <SectionHeader title="Meet your Trainer" />
        <div className="flex gap-4 overflow-x-auto pb-1">
          <TrainerCard
            name="Martyna"
            title="Founder · Head Coach"
            imageUrl="https://images.unsplash.com/photo-1546484959-f9a9ae384058?w=600&q=80"
          />
          <TrainerCard
            name="Guest Coach"
            title="Mindful Movement"
            imageUrl="https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80"
          />
        </div>
      </div>

      {/* Bottom navigation mock (non-functional, for visual onboarding only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex justify-between items-center max-w-md mx-auto text-xs">
          <NavItem label="Home" icon={<PlayCircle className="w-5 h-5" />} active />
          <NavItem label="Workout" icon={<Dumbbell className="w-5 h-5" />} />
          <NavItem label="Meals" icon={<Utensils className="w-5 h-5" />} />
          <NavItem label="Profile" icon={<User2 className="w-5 h-5" />} />
        </div>
      </nav>
    </div>
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

function SectionHeader({ title, badge }: { title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-[#333]">{title}</h2>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFEDD5] text-[#FF6B35]">
            {badge}
          </span>
        )}
      </div>
      <button className="text-xs text-[#4A90E2] font-medium">View all</button>
    </div>
  )
}

function HorizontalCardRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-1">
      {children}
    </div>
  )
}

function StepCard({
  title,
  subtitle,
  minutes,
  imageUrl,
}: {
  title: string
  subtitle: string
  minutes: number
  imageUrl: string
}) {
  return (
    <div className="w-56 shrink-0 rounded-2xl overflow-hidden shadow-md bg-gray-900 text-white relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
      
    </div>
  )
}

function ClassCard({
  title,
  subtitle,
  tag,
  imageUrl,
}: {
  title: string
  subtitle: string
  tag: string
  imageUrl: string
}) {
  return (
    <div className="w-44 shrink-0 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
      <div
        className="h-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-[#333] line-clamp-1">{title}</h3>
        <p className="text-xs text-[#777] line-clamp-1">{subtitle}</p>
        <span className="inline-flex mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0369A1]">
          {tag}
        </span>
      </div>
    </div>
  )
}

function MealCard({
  title,
  subtitle,
  imageUrl,
}: {
  title: string
  subtitle: string
  imageUrl: string
}) {
  return (
    <div className="w-40 shrink-0 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
      <div
        className="h-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-[#333] line-clamp-1">{title}</h3>
        <p className="text-xs text-[#777] line-clamp-1">{subtitle}</p>
      </div>
    </div>
  )
}

function TrainerCard({
  name,
  title,
  imageUrl,
}: {
  name: string
  title: string
  imageUrl: string
}) {
  return (
    <div className="w-44 shrink-0 rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
      <div
        className="h-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-[#333]">{name}</h3>
        <p className="text-xs text-[#777] line-clamp-2">{title}</p>
      </div>
    </div>
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
      className={`flex flex-col items-center gap-0.5 text-[11px] ${
        active ? 'text-[#4A90E2]' : 'text-gray-500'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}


