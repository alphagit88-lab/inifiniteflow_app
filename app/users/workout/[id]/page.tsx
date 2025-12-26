'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  Heart, 
  Share2, 
  Bookmark, 
  Check
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserBottomNav } from '@/components/user-bottom-nav'
import { mockWorkoutDetail } from '@/lib/types/workout'

export default function WorkoutDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [workout, setWorkout] = useState(mockWorkoutDetail)
  const [activeTab, setActiveTab] = useState<'comments' | 'notes'>('comments')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Video Player Section */}
      <div className="relative">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-20 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-[#333]" />
        </button>

        {/* Video Thumbnail */}
        <div className="relative aspect-video bg-gray-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${workout.image})` }}
          />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Play Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              {isPlaying ? (
                <Pause className="w-7 h-7 text-[#333]" fill="currentColor" />
              ) : (
                <Play className="w-7 h-7 text-[#333] ml-1" fill="currentColor" />
              )}
            </div>
          </button>

          {/* Video Duration */}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {workout.duration}
          </div>

          {/* Action Icons */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-[#666]'}`} />
            </button>
            <button className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
              <Share2 className="w-4 h-4 text-[#666]" />
            </button>
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'text-[#4A90E2] fill-[#4A90E2]' : 'text-[#666]'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        {/* Title & Details */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#333]">{workout.title}</h1>
        </div>

        {/* Workout Details Card */}
        <Card className="rounded-xl border-none shadow-sm bg-white p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#333] mb-2">Workout Details</h3>
          <p className="text-xs text-[#666] leading-relaxed">{workout.description}</p>
        </Card>

        {/* Start Workout Button */}
        <Button className="w-full rounded-full bg-[#4A90E2] hover:bg-[#3A7BC8] text-white py-3 mb-4">
          Next workout
        </Button>

        {/* Instructions */}
        <Card className="rounded-xl border-none shadow-sm bg-white p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#333] mb-2">Instructions</h3>
          <p className="text-xs text-[#666] leading-relaxed whitespace-pre-line">
            {workout.instructions}
          </p>
        </Card>

        {/* Workout List */}
        <Card className="rounded-xl border-none shadow-sm bg-white p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#333] mb-3">Workout list</h3>
          <div className="space-y-3">
            {workout.workoutList.map((exercise, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    exercise.completed 
                      ? 'bg-[#4A90E2] border-[#4A90E2]' 
                      : 'border-gray-300'
                  }`}>
                    {exercise.completed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-[#333]">{exercise.name}</span>
                </div>
                <span className="text-xs text-[#999]">{exercise.duration}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Equipment */}
        <Card className="rounded-xl border-none shadow-sm bg-white p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#333] mb-2">Equipments</h3>
          <ul className="space-y-1">
            {workout.equipment.map((item, idx) => (
              <li key={idx} className="text-xs text-[#666] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A90E2]" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Equipment List Card */}
        <Card className="rounded-xl border-none shadow-sm bg-white p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#333] mb-2">Equipment List</h3>
          <ul className="space-y-1">
            <li className="text-xs text-[#666] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#333]" />
              Foam Roller
            </li>
            <li className="text-xs text-[#666] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#333]" />
              Resistance bands
            </li>
            <li className="text-xs text-[#666] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#333]" />
              Resistance bands
            </li>
          </ul>
        </Card>

        {/* Notes from Trainer */}
        <Card className="rounded-xl border-none shadow-sm bg-white p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#333] mb-2">Notes from the trainer</h3>
          <p className="text-xs text-[#666] leading-relaxed">{workout.notes}</p>
        </Card>

        {/* Comments & Notes Tabs */}
        <Card className="rounded-xl border-none shadow-sm bg-white p-4">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'comments' 
                  ? 'border-[#4A90E2] text-[#4A90E2]' 
                  : 'border-transparent text-[#999]'
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'notes' 
                  ? 'border-[#4A90E2] text-[#4A90E2]' 
                  : 'border-transparent text-[#999]'
              }`}
            >
              Notes
            </button>
          </div>

          {activeTab === 'comments' ? (
            <div className="space-y-3">
              {/* Comment Input */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Add a comment"
                  className="flex-1 text-xs bg-transparent outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Comments List */}
              {workout.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#333]">{comment.user.name}</span>
                      <span className="text-[10px] text-[#999]">{comment.date}</span>
                    </div>
                    {comment.text && (
                      <p className="text-xs text-[#666] mt-0.5">{comment.text}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#999]">
                    <Heart className="w-3 h-3" />
                    <span>{comment.likes}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-[#666]">Your personal notes for this workout will appear here.</p>
              <textarea
                placeholder="Add your notes..."
                className="w-full h-24 text-xs p-2 bg-gray-50 rounded-lg outline-none resize-none placeholder:text-gray-400"
              />
            </div>
          )}
        </Card>
      </main>

      {/* Bottom Navigation */}
      <UserBottomNav />
    </div>
  )
}
