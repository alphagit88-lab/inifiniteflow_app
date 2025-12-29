'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { getClassVideos, updateClassVideoOrder, type ClassVideo } from '@/app/actions/class-videos'
import { Play, Loader2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ViewClassVideosDialogProps {
  classId: string | null
  className: string
  open: boolean
  onClose: () => void
}

type VideoData = {
  video_id: string
  description: string | null
  mux_playback_id: string | null
  thumbnail_url: string | null
  meta_title: string | null
}

export function ViewClassVideosDialog({ classId, className, open, onClose }: ViewClassVideosDialogProps) {
  const [classVideos, setClassVideos] = useState<Array<ClassVideo & { video?: VideoData }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  useEffect(() => {
    if (open && classId) {
      const fetchVideos = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const result = await getClassVideos(classId)
          if (result.success && result.data) {
            // Transform the data to match our state structure
            const transformed = result.data.map((cv: any) => {
              const videoData = cv.videos || cv.video
              return {
                class_video_id: cv.class_video_id,
                class_id: cv.class_id,
                video_id: cv.video_id,
                description: cv.description,
                sort_order: cv.sort_order,
                created_at: cv.created_at,
                video: videoData ? {
                  video_id: videoData.video_id,
                  description: videoData.description,
                  mux_playback_id: videoData.mux_playback_id,
                  thumbnail_url: videoData.thumbnail_url,
                  meta_title: videoData.meta_title || null,
                } : undefined,
              }
            })
            // Sort by sort_order
            const sorted = transformed.sort((a, b) => {
              const aOrder = a.sort_order ?? 999
              const bOrder = b.sort_order ?? 999
              return aOrder - bOrder
            })
            setClassVideos(sorted)
          } else {
            setError(result.error || 'Failed to load videos')
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load videos')
        } finally {
          setIsLoading(false)
        }
      }
      fetchVideos()
    } else {
      setClassVideos([])
      setError(null)
      setPreviewVideoId(null)
    }
  }, [open, classId])

  const getThumbnailUrl = (video: VideoData | undefined): string | null => {
    if (!video) return null
    if (video.thumbnail_url) return video.thumbnail_url
    if (video.mux_playback_id) {
      return `https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop`
    }
    return null
  }

  const getVideoUrl = (video: VideoData | undefined): string | null => {
    if (!video) return null
    if (video.mux_playback_id) {
      return `https://stream.mux.com/${video.mux_playback_id}.m3u8`
    }
    return null
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const draggedItem = classVideos[draggedIndex]
    const newVideos = [...classVideos]
    
    // Remove dragged item from its original position
    newVideos.splice(draggedIndex, 1)
    
    // Insert dragged item at new position
    newVideos.splice(dropIndex, 0, draggedItem)

    // Update sort_order for all items
    const updates = newVideos.map((cv, index) => ({
      class_video_id: cv.class_video_id,
      sort_order: index,
    }))

    setIsReordering(true)
    try {
      const result = await updateClassVideoOrder(updates)
      if (result.success) {
        // Update local state with new order
        const updatedVideos = newVideos.map((cv, index) => ({
          ...cv,
          sort_order: index,
        }))
        setClassVideos(updatedVideos)
      } else {
        setError(result.error || 'Failed to update video order')
        // Revert to original order on error
        const fetchVideos = async () => {
          const result = await getClassVideos(classId!)
          if (result.success && result.data) {
            const transformed = result.data.map((cv: any) => {
              const videoData = cv.videos || cv.video
              return {
                class_video_id: cv.class_video_id,
                class_id: cv.class_id,
                video_id: cv.video_id,
                description: cv.description,
                sort_order: cv.sort_order,
                created_at: cv.created_at,
                video: videoData ? {
                  video_id: videoData.video_id,
                  description: videoData.description,
                  mux_playback_id: videoData.mux_playback_id,
                  thumbnail_url: videoData.thumbnail_url,
                  meta_title: videoData.meta_title || null,
                } : undefined,
              }
            })
            const sorted = transformed.sort((a, b) => {
              const aOrder = a.sort_order ?? 999
              const bOrder = b.sort_order ?? 999
              return aOrder - bOrder
            })
            setClassVideos(sorted)
          }
        }
        fetchVideos()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update video order')
    } finally {
      setIsReordering(false)
      setDraggedIndex(null)
      setDragOverIndex(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Videos for: {className}</DialogTitle>
          <DialogDescription>
            View and preview all videos in this class
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading videos...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : classVideos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No videos found for this class.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classVideos.map((classVideo, index) => {
              const video = classVideo.video
              const thumbnailUrl = getThumbnailUrl(video)
              const videoUrl = getVideoUrl(video)
              const isPreviewing = previewVideoId === classVideo.video_id
              const isDragging = draggedIndex === index
              const isDragOver = dragOverIndex === index

              return (
                <Card
                  key={classVideo.class_video_id}
                  className={`p-4 transition-all ${
                    isDragging ? 'opacity-50' : ''
                  } ${
                    isDragOver ? 'border-2 border-primary bg-primary/5' : ''
                  } ${
                    isReordering ? 'cursor-wait' : 'cursor-move'
                  }`}
                  draggable={!isReordering}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex gap-4">
                    {/* Drag Handle */}
                    <div className="flex items-center cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    {/* Video Thumbnail/Preview */}
                    <div className="relative w-48 h-32 flex-shrink-0 rounded-md overflow-hidden border bg-gray-100">
                      {isPreviewing && videoUrl ? (
                        <video
                          src={videoUrl}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                          onError={() => setPreviewVideoId(null)}
                        />
                      ) : thumbnailUrl ? (
                        <>
                          <img
                            src={thumbnailUrl}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          {videoUrl && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Play className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Video Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-sm">
                          {index + 1}. {video?.meta_title || video?.description || `Video ${index + 1}`}
                        </h4>
                        {classVideo.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {classVideo.description}
                          </p>
                        )}
                        {video?.description && video.description !== classVideo.description && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Original: {video.description}
                          </p>
                        )}
                      </div>

                      {video?.mux_playback_id && (
                        <div className="text-xs text-muted-foreground">
                          Playback ID: {video.mux_playback_id}
                        </div>
                      )}

                      {/* Preview Button */}
                      {videoUrl && (
                        <Button
                          type="button"
                          variant={isPreviewing ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isPreviewing) {
                              setPreviewVideoId(null)
                            } else {
                              setPreviewVideoId(classVideo.video_id)
                            }
                          }}
                          disabled={isReordering}
                        >
                          {isPreviewing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Stop Preview
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Preview Video
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

