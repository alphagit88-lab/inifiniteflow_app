'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Search, Filter, Clock, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UserBottomNav } from '@/components/user-bottom-nav'
import { mockClasses, type WorkoutClass } from '@/lib/types/workout'

export default function WorkoutListPage() {
  const router = useRouter()
  const [classes] = useState<WorkoutClass[]>(mockClasses)

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Header */}
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-[#333]">Workout</h1>
      </header>

      {/* Classes Section */}
      <main className="flex-1 px-4 pb-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[#666]">Classes</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <Search className="w-4 h-4 text-[#666]" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <Filter className="w-4 h-4 text-[#666]" />
            </button>
          </div>
        </div>

        {/* Class Cards */}
        <div className="space-y-4">
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classData={classItem}
              onClick={() => router.push(`/users/workout/${classItem.id}`)}
            />
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <UserBottomNav />
    </div>
  )
}

function ClassCard({
  classData,
  onClick,
}: {
  classData: WorkoutClass
  onClick: () => void
}) {
  return (
    <Card
      className="rounded-2xl overflow-hidden border-none shadow-md bg-white cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex">
        {/* Image Section */}
        <div className="relative w-28 h-32 shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${classData.image})` }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-transparent to-black/10" />
          {/* Duration Badge */}
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {classData.duration}
          </div>
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
              <Play className="w-4 h-4 text-[#333] ml-0.5" fill="currentColor" />
            </div>
          </div>
          {/* Search & Filter Icons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button className="w-5 h-5 bg-white/80 rounded-full flex items-center justify-center">
              <Search className="w-3 h-3 text-[#666]" />
            </button>
            <button className="w-5 h-5 bg-white/80 rounded-full flex items-center justify-center">
              <Filter className="w-3 h-3 text-[#666]" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#333]">{classData.title}</h3>
              <p className="text-xs text-[#999] mt-0.5">{classData.subtitle}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#ccc]" />
          </div>

          {/* Exercise List */}
          <div className="mt-3 space-y-2">
            {classData.exercises.map((exercise, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-xs text-[#666]">{exercise.name}</span>
                <span className="text-xs text-[#999]">{exercise.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
