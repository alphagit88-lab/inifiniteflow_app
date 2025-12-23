'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Class } from '@/actions/classes'
import { getVideos, type Video } from '@/app/actions/mux'
import { getClassVideos, createClassVideo, deleteClassVideo, updateClassVideo, updateClassVideoOrder, type ClassVideo } from '@/app/actions/class-videos'
import { getInstructors, type Instructor } from '@/actions/instructors'
import { uploadBadge } from '@/app/actions/badges'
import { Trash2, Plus, Play, GripVertical } from 'lucide-react'

const INTENSITY_OPTIONS = ['Low', 'Medium', 'High', 'Very High'] as const
const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const
const CATEGORY_OPTIONS = ['Yoga', 'Pilates', 'Cardio', 'Strength', 'Flexibility', 'Meditation', 'HIIT', 'Dance', 'Other'] as const

type EditableClass = Pick<
  Class,
  | 'class_id'
  | 'class_name'
  | 'description'
  | 'category'
  | 'level'
  | 'duration'
  | 'intensity_level'
  | 'is_premium'
  | 'is_published'
  | 'notes'
  | 'instructor_id'
>

interface EditClassModalProps {
  classData: EditableClass | null
  onClose: () => void
  onClassUpdated: (classData: Class) => void
}

export function EditClassModal({ classData, onClose, onClassUpdated }: EditClassModalProps) {
  const [formData, setFormData] = useState({
    class_name: '',
    description: '',
    instructor_id: '',
    category: 'Pilates' as (typeof CATEGORY_OPTIONS)[number],
    level: LEVEL_OPTIONS[0],
    duration: 30,
    intensity_level: INTENSITY_OPTIONS[0],
    is_premium: false,
    is_published: false,
    notes: '',
    challenge: false,
    badge: '',
  })
  const [selectedBadge, setSelectedBadge] = useState<File | null>(null)
  const [badgePreview, setBadgePreview] = useState<string | null>(null)
  const badgeInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableVideos, setAvailableVideos] = useState<Video[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false)
  const [classVideos, setClassVideos] = useState<Array<ClassVideo & { video?: Partial<Video> }>>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string>('')
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [isLoadingClassVideos, setIsLoadingClassVideos] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  // Fetch available videos and instructors on mount
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingVideos(true)
      try {
        const result = await getVideos()
        if (result.success && result.data) {
          setAvailableVideos(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err)
      } finally {
        setIsLoadingVideos(false)
      }
    }
    
    const fetchInstructors = async () => {
      setIsLoadingInstructors(true)
      try {
        const result = await getInstructors()
        if (result.success && result.data) {
          setInstructors(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch instructors:', err)
      } finally {
        setIsLoadingInstructors(false)
      }
    }
    
    fetchVideos()
    fetchInstructors()
  }, [])

  // Fetch class videos when classData changes
  useEffect(() => {
    if (classData?.class_id) {
      const fetchClassVideos = async () => {
        setIsLoadingClassVideos(true)
        try {
          const result = await getClassVideos(classData.class_id)
          if (result.success && result.data) {
            // Transform the data to match our state structure
            // Supabase returns nested data, so we need to handle it properly
            const transformed = result.data.map((cv: any) => {
              // The video data might be nested as 'videos' (object) or directly as 'video'
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
          }
        } catch (err) {
          console.error('Failed to fetch class videos:', err)
        } finally {
          setIsLoadingClassVideos(false)
        }
      }
      fetchClassVideos()
    } else {
      setClassVideos([])
    }
  }, [classData?.class_id])

  useEffect(() => {
    if (classData) {
      setFormData({
        class_name: classData.class_name || '',
        description: classData.description || '',
        instructor_id: classData.instructor_id || '',
        category: 'Pilates' as (typeof CATEGORY_OPTIONS)[number], // Always set to Pilates
        level: (LEVEL_OPTIONS.includes(classData.level as any)
          ? classData.level
          : LEVEL_OPTIONS[0]) as typeof formData.level,
        duration: classData.duration || 30,
        intensity_level: (INTENSITY_OPTIONS.includes(classData.intensity_level as any)
          ? classData.intensity_level
          : INTENSITY_OPTIONS[0]) as typeof formData.intensity_level,
        is_premium: classData.is_premium || false,
        is_published: classData.is_published || false,
        notes: classData.notes || '',
        challenge: (classData as any).challenge || false,
        badge: (classData as any).badge || '',
      })
      setSelectedBadge(null)
      const existingBadge = (classData as any).badge
      setBadgePreview(existingBadge || null)
      setError(null)
    }
  }, [classData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classData?.class_id) {
      setError('Class ID is missing')
      return
    }

    if (!formData.class_name.trim() || !formData.description.trim()) {
      setError('Class name and description are required')
      return
    }

    if (!formData.instructor_id) {
      setError('Please select an instructor')
      return
    }

    if (formData.duration <= 0) {
      setError('Duration must be greater than 0')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Upload badge if challenge is true and badge is selected
      let badgeUrl = formData.badge
      if (formData.challenge && selectedBadge) {
        const badgeResult = await uploadBadge(selectedBadge, classData.class_id)
        if (badgeResult.success && badgeResult.url) {
          badgeUrl = badgeResult.url
        } else {
          console.warn('Failed to upload badge:', badgeResult.error)
          setError(badgeResult.error || 'Failed to upload badge')
          setIsSubmitting(false)
          return
        }
      }

      const response = await fetch(`/api/classes/${classData.class_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_name: formData.class_name.trim(),
          description: formData.description.trim(),
          instructor_id: formData.instructor_id,
          category: 'Pilates', // Always set to Pilates
          level: formData.level,
          duration: formData.duration,
          intensity_level: formData.intensity_level,
          is_premium: formData.is_premium,
          is_published: formData.is_published,
          notes: formData.notes.trim() || null,
          challenge: formData.challenge,
          badge: badgeUrl || null,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update class')
      }

      onClassUpdated(payload.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update class')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddVideo = async () => {
    if (!selectedVideoId || !classData?.class_id) return

    // Check if video is already added
    if (classVideos.some(cv => cv.video_id === selectedVideoId)) {
      setError('This video is already added to the class')
      return
    }

    // Find the video details to get its description
    const video = availableVideos.find(v => v.video_id === selectedVideoId)
    if (!video) {
      setError('Video not found')
      return
    }

    try {
      // Use video's description as default, but allow it to be edited later
      const result = await createClassVideo({
        class_id: classData.class_id,
        video_id: selectedVideoId,
        description: video.description || null,
      })

      if (result.success && result.data) {
        setClassVideos([...classVideos, { ...result.data, video }])
        setSelectedVideoId('')
      } else {
        setError(result.error || 'Failed to add video')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video')
    }
  }

  const handleRemoveVideo = async (classVideoId: string) => {
    if (!confirm('Are you sure you want to remove this video from the class?')) return

    try {
      const result = await deleteClassVideo(classVideoId)
      if (result.success) {
        setClassVideos(classVideos.filter(cv => cv.class_video_id !== classVideoId))
      } else {
        setError(result.error || 'Failed to remove video')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove video')
    }
  }

  const handleUpdateVideoDescription = async (classVideoId: string, description: string) => {
    try {
      const result = await updateClassVideo({
        class_video_id: classVideoId,
        description: description.trim() || null,
      })

      if (result.success && result.data) {
        setClassVideos(classVideos.map(cv => 
          cv.class_video_id === classVideoId 
            ? { ...cv, description: result.data!.description }
            : cv
        ))
      }
    } catch (err) {
      console.error('Failed to update video description:', err)
    }
  }

  const getThumbnailUrl = (video: Partial<Video> | undefined): string | null => {
    if (!video) return null
    if (video.thumbnail_url) return video.thumbnail_url
    if (video.mux_playback_id) {
      return `https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop`
    }
    return null
  }

  // Filter out videos that are already added
  const availableVideosToAdd = availableVideos.filter(
    video => !classVideos.some(cv => cv.video_id === video.video_id)
  )

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
        const fetchClassVideos = async () => {
          if (classData?.class_id) {
            const result = await getClassVideos(classData.class_id)
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
        }
        fetchClassVideos()
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
    <Dialog open={Boolean(classData)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>Update the class details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-class-name">Class Name *</Label>
            <Input
              id="edit-class-name"
              placeholder="Morning Yoga Flow"
              value={formData.class_name}
              onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              placeholder="A relaxing morning yoga flow to start your day..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-instructor">Instructor *</Label>
            <Select
              value={formData.instructor_id}
              onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}
              disabled={isSubmitting || isLoadingInstructors || instructors.length === 0}
              required
            >
              <SelectTrigger id="edit-instructor">
                <SelectValue placeholder={isLoadingInstructors ? "Loading instructors..." : instructors.length === 0 ? "No instructors available" : "Select an instructor..."} />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((instructor) => {
                  const displayText = instructor.bio 
                    ? `${instructor.bio.substring(0, 60)}${instructor.bio.length > 60 ? '...' : ''}`
                    : `Instructor ${instructor.instructor_id.substring(0, 8)}...`
                  return (
                    <SelectItem key={instructor.instructor_id} value={instructor.instructor_id}>
                      {displayText}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value="Pilates"
                disabled={true}
              >
                <SelectTrigger id="edit-category" className="bg-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pilates">Pilates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-level">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, level: value as typeof formData.level })
                  }
              >
                <SelectTrigger id="edit-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-duration">Duration (minutes) *</Label>
              <Input
                id="edit-duration"
                type="number"
                min="1"
                placeholder="30"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-intensity">Intensity Level *</Label>
                <Select
                  value={formData.intensity_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, intensity_level: value as typeof formData.intensity_level })
                  }
              >
                <SelectTrigger id="edit-intensity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTENSITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-premium">Premium Class</Label>
              <Select
                value={formData.is_premium ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, is_premium: value === 'true' })}
              >
                <SelectTrigger id="edit-premium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Free</SelectItem>
                  <SelectItem value="true">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-published">Published Status</Label>
              <Select
                value={formData.is_published ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, is_published: value === 'true' })}
              >
                <SelectTrigger id="edit-published">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Draft</SelectItem>
                  <SelectItem value="true">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (Optional)</Label>
            <Textarea
              id="edit-notes"
              placeholder="Additional notes about this class..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Challenge</Label>
            <RadioGroup
              value={formData.challenge ? 'true' : 'false'}
              onValueChange={(value) => setFormData({ ...formData, challenge: value === 'true' })}
              disabled={isSubmitting}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="edit-challenge-false" />
                <Label htmlFor="edit-challenge-false" className="font-normal cursor-pointer">False</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="edit-challenge-true" />
                <Label htmlFor="edit-challenge-true" className="font-normal cursor-pointer">True</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.challenge && (
            <div className="space-y-2">
              <Label htmlFor="edit-badge">Badge Image (SVG, JPEG, or PNG)</Label>
              <div className="space-y-2">
                <Input
                  id="edit-badge"
                  type="file"
                  accept=".svg,.jpeg,.jpg,.png,image/svg+xml,image/jpeg,image/png"
                  ref={badgeInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedBadge(file)
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setBadgePreview(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                />
                {badgePreview && (
                  <div className="mt-2">
                    <img
                      src={badgePreview}
                      alt="Badge preview"
                      className="max-w-[200px] max-h-[200px] object-contain border rounded-md"
                    />
                  </div>
                )}
                {formData.badge && !badgePreview && (
                  <div className="mt-2">
                    <img
                      src={formData.badge}
                      alt="Current badge"
                      className="max-w-[200px] max-h-[200px] object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Workouts Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Workouts</h3>
                <p className="text-sm text-muted-foreground">Add videos to this class</p>
              </div>
            </div>

            {/* Add Video Section */}
            <div className="space-y-2">
              <Label>Add Video</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedVideoId}
                  onValueChange={setSelectedVideoId}
                  disabled={isLoadingVideos || availableVideosToAdd.length === 0}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={isLoadingVideos ? "Loading videos..." : availableVideosToAdd.length === 0 ? "No videos available" : "Select a video..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVideosToAdd.map((video) => (
                      <SelectItem key={video.video_id} value={video.video_id}>
                        {video.meta_title || video.description || video.video_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddVideo}
                  disabled={!selectedVideoId || isLoadingVideos}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Class Videos List */}
            {isLoadingClassVideos ? (
              <p className="text-sm text-muted-foreground">Loading workouts...</p>
            ) : classVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No videos added yet. Add videos using the selector above.</p>
            ) : (
              <div className="space-y-4">
                {classVideos.map((classVideo, index) => {
                  const video = classVideo.video
                  const thumbnailUrl = getThumbnailUrl(video)
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
                        {/* Video Preview */}
                        {thumbnailUrl && (
                          <div className="relative w-32 h-20 flex-shrink-0 rounded-md overflow-hidden border">
                            <img
                              src={thumbnailUrl}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                            {video?.mux_playback_id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Video Details */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="font-medium text-sm">
                              {video?.meta_title || video?.description || 'Video'}
                            </p>
                            {video?.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {video.description}
                              </p>
                            )}
                          </div>

                          {/* Video Description Input */}
                          <div className="space-y-1">
                            <Label className="text-xs">Video Description (for this class)</Label>
                            <Textarea
                              placeholder="Add a description for this video in this class..."
                              value={classVideo.description || ''}
                              onChange={(e) => {
                                // Update local state immediately
                                setClassVideos(classVideos.map(cv => 
                                  cv.class_video_id === classVideo.class_video_id 
                                    ? { ...cv, description: e.target.value }
                                    : cv
                                ))
                              }}
                              onBlur={(e) => {
                                // Save to database on blur
                                handleUpdateVideoDescription(classVideo.class_video_id, e.target.value)
                              }}
                              rows={2}
                              className="text-sm"
                              disabled={isReordering}
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVideo(classVideo.class_video_id)}
                          className="text-destructive hover:text-destructive"
                          disabled={isReordering}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

