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
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Slider } from '@/components/ui/slider'
import { UserBottomNav } from '@/components/user-bottom-nav'

// Mock data for workout video
const mockWorkoutVideo = {
  id: '1',
  title: 'Ab Burner Workout',
  image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  videoUrl: 'https://example.com/video.mp4',
  duration: '30:00',
  currentTime: '0:00',
  instructor: {
    name: 'Clara Martinez',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
  },
  instructions: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu euismod lorem, non facilisis elit. Praesent eu euismod.

adipiscing elit. Praesent eu euismod lorem. Nulla non rutrum eros. Maecenas a pretium neque. Morbi vehicula porta convallis. Ut amet tellus eros.

adipiscing elit. Praesent eu euismod lorem. Nulla porta a pretulum neque. Maecenas vehicula porta convallis, ut amet tellus eros. Vehicula porta diam massa nisi.`,
  equipment: [
    'Foam Roller',
    'Resistance bands',
  ],
  comments: [
    {
      id: '1',
      user: {
        name: 'Nana Paul',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
      },
      text: 'This workout was amazing!',
      date: 'now',
      likes: 0,
    },
    {
      id: '2', 
      user: {
        name: 'Jessica Jodan',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
      },
      text: '',
      date: '2d ago',
      likes: 1,
    },
  ],
}

export default function WorkoutVideoPage() {
  const router = useRouter()
  const params = useParams()
  const [workout] = useState(mockWorkoutVideo)
  const [activeTab, setActiveTab] = useState<'comments' | 'notes'>('comments')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [progress, setProgress] = useState(0)

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex flex-col">
      {/* Video Player Section */}
      <div className="relative bg-gray-900">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-20 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-[#333]" />
        </button>

        {/* Video Display */}
        <div className="relative aspect-video">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${workout.image})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          
          {/* Video Controls Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            {/* Progress Bar */}
            <div className="mb-2">
              <Slider
                value={[progress]}
                max={100}
                step={1}
                onValueChange={(value) => setProgress(value[0])}
                className="w-full"
              />
            </div>

            {/* Time & Controls */}
            <div className="flex items-center justify-between text-white">
              <span className="text-xs">{workout.currentTime}</span>
              
              <div className="flex items-center gap-4">
                <button className="w-8 h-8 flex items-center justify-center">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-[#333]" fill="currentColor" />
                  ) : (
                    <Play className="w-6 h-6 text-[#333] ml-1" fill="currentColor" />
                  )}
                </button>
                <button className="w-8 h-8 flex items-center justify-center">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              <span className="text-xs">{workout.duration}</span>
            </div>

            {/* Bottom Action Icons */}
            <div className="flex justify-end gap-2 mt-2">
              <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Action Icons - Top Right */}
          <div className="absolute top-4 right-4 flex gap-2">
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
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-xl font-bold text-[#333]">{workout.title}</h1>
        </div>

        {/* Next Workout Button */}
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

        {/* Equipment */}
        <Card className="rounded-xl border-none shadow-sm bg-white p-4 mb-4">
          <h3 className="text-sm font-semibold text-[#333] mb-2">Equipments</h3>
          <ul className="space-y-1">
            {workout.equipment.map((item, idx) => (
              <li key={idx} className="text-xs text-[#666] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#333]" />
                {item}
              </li>
            ))}
          </ul>
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
