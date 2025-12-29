'use client'

import { useState } from 'react'
import { VideosDataTable } from './videos-data-table'
import { AddVideoDialog } from './add-video-dialog'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { Video } from '@/app/actions/mux'

interface VideosPageClientProps {
  initialVideos: Video[]
}

export function VideosPageClient({ initialVideos }: VideosPageClientProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleVideoAdded = () => {
    // Trigger a refresh of the videos list
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      <VideosDataTable refreshKey={refreshKey} initialVideos={initialVideos} />

      <AddVideoDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onVideoAdded={handleVideoAdded}
      />
    </div>
  )
}

