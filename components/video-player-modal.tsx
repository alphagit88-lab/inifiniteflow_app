'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import MuxPlayer to avoid SSR issues
const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), {
  ssr: false,
})

interface VideoPlayerModalProps {
  playbackId: string | null
  videoTitle?: string
  open: boolean
  onClose: () => void
}

export function VideoPlayerModal({ playbackId, videoTitle, open, onClose }: VideoPlayerModalProps) {
  if (!playbackId) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] p-0 gap-0" showCloseButton={false}>
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>{videoTitle || 'Video Player'}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            <MuxPlayer
              playbackId={playbackId}
              streamType="on-demand"
              metadata={{
                video_title: videoTitle || 'Video',
              }}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

