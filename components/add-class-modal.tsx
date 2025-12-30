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
import { uploadBanner } from '@/app/actions/banners'
import { Trash2, Plus, Play, GripVertical } from 'lucide-react'

const INTENSITY_OPTIONS = ['Low', 'Medium', 'High', 'Very High'] as const
const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

interface AddClassModalProps {
  open: boolean
  onClose: () => void
  onClassCreated: (classData: Class) => void
}

export function AddClassModal({ open, onClose, onClassCreated }: AddClassModalProps) {
  const [formData, setFormData] = useState({
    class_name: '',
    description: '',
    instructor_id: '',
    level: LEVEL_OPTIONS[0],
    duration: 30,
    intensity_level: INTENSITY_OPTIONS[0],
    is_premium: false,
    is_published: false,
    notes: '',
    challenge: false,
    badge: '',
    challenge_start_date: '',
    challenge_end_date: '',
  })
  const [selectedBadge, setSelectedBadge] = useState<File | null>(null)
  const [badgePreview, setBadgePreview] = useState<string | null>(null)
  const badgeInputRef = useRef<HTMLInputElement>(null)
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableVideos, setAvailableVideos] = useState<Video[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false)
  // Store pending videos (before class is created) and actual class videos (after creation)
  const [pendingVideos, setPendingVideos] = useState<Array<{ video: Video; description: string }>>([])
  const [classVideos, setClassVideos] = useState<Array<ClassVideo & { video?: Partial<Video> }>>([])
  const [selectedVideoId, setSelectedVideoId] = useState<string>('')
  const [isLoadingVideos, setIsLoadingVideos] = useState(false)
  const [createdClassId, setCreatedClassId] = useState<string | null>(null)

  // Fetch available videos and instructors on mount
  useEffect(() => {
    if (open) {
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
          if (result.success && result.data && result.data.length > 0) {
            setInstructors(result.data)
            // Set first instructor as default if available
            if (!formData.instructor_id) {
              setFormData(prev => ({ ...prev, instructor_id: result.data![0].instructor_id }))
            }
          }
        } catch (err) {
          console.error('Failed to fetch instructors:', err)
        } finally {
          setIsLoadingInstructors(false)
        }
      }
      
      fetchVideos()
      fetchInstructors()
    }
  }, [open])

  // Fetch class videos after class is created (if no pending videos were just created)
  useEffect(() => {
    if (createdClassId && classVideos.length === 0) {
      const fetchClassVideos = async () => {
        try {
          const result = await getClassVideos(createdClassId)
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
            setClassVideos(transformed)
          }
        } catch (err) {
          console.error('Failed to fetch class videos:', err)
        }
      }
      fetchClassVideos()
    }
  }, [createdClassId])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        class_name: '',
        description: '',
        instructor_id: instructors.length > 0 ? instructors[0].instructor_id : '',
        level: LEVEL_OPTIONS[0],
        duration: 30,
        intensity_level: INTENSITY_OPTIONS[0],
        is_premium: false,
        is_published: false,
        notes: '',
        challenge: false,
        badge: '',
        challenge_start_date: '',
        challenge_end_date: '',
      })
      setSelectedBadge(null)
      setBadgePreview(null)
      setSelectedBanner(null)
      setBannerPreview(null)
      setPendingVideos([])
      setClassVideos([])
      setSelectedVideoId('')
      setCreatedClassId(null)
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const response = await fetch('/api/classes', {
        method: 'POST',
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
          badge: formData.badge || null,
          challenge_start_date: formData.challenge_start_date ? new Date(formData.challenge_start_date).toISOString() : null,
          challenge_end_date: formData.challenge_end_date ? new Date(formData.challenge_end_date).toISOString() : null,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create class')
      }

      // Upload badge if challenge is true and badge is selected
      let badgeUrl = formData.badge
      if (formData.challenge && selectedBadge) {
        const badgeResult = await uploadBadge(selectedBadge, payload.data.class_id)
        if (badgeResult.success && badgeResult.url) {
          badgeUrl = badgeResult.url
          // Update class with badge URL
          await fetch(`/api/classes/${payload.data.class_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              badge: badgeUrl,
            }),
          })
        } else {
          console.warn('Failed to upload badge:', badgeResult.error)
        }
      }

      // Upload banner image if selected
      let bannerUrl = null
      if (selectedBanner) {
        const bannerResult = await uploadBanner(selectedBanner, payload.data.class_id)
        if (bannerResult.success && bannerResult.url) {
          bannerUrl = bannerResult.url
          // Update class with banner URL
          await fetch(`/api/classes/${payload.data.class_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              banner_image: bannerUrl,
            }),
          })
        } else {
          console.warn('Failed to upload banner:', bannerResult.error)
        }
      }

      // Create pending videos if any
      const newClassId = payload.data.class_id
      if (pendingVideos.length > 0) {
        try {
          const createPromises = pendingVideos.map((pv, index) =>
            createClassVideo({
              class_id: newClassId,
              video_id: pv.video.video_id,
              description: pv.description || null,
              sort_order: index,
            })
          )

          const results = await Promise.all(createPromises)
          const successful = results.filter(r => r.success && r.data)
          
          // Transform to match classVideos structure
          const transformed = successful.map((result, index) => ({
            ...result.data!,
            video: pendingVideos[index].video,
          }))
          
          setClassVideos(transformed)
          setPendingVideos([]) // Clear pending videos
        } catch (err) {
          console.error('Failed to create pending videos:', err)
          setError('Class created but some videos failed to add. You can add them manually.')
        }
      }
      
      // Set the created class ID
      setCreatedClassId(newClassId)
      setIsSubmitting(false)
      
      // Don't close the modal - allow user to continue adding videos or close manually
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create class')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (createdClassId) {
      // Fetch the full class data before closing to ensure we have the latest data
      const fetchClass = async () => {
        try {
          const response = await fetch(`/api/classes/${createdClassId}`)
          if (response.ok) {
            const payload = await response.json()
            if (payload.data) {
              onClassCreated(payload.data)
            }
          }
        } catch (err) {
          console.error('Failed to fetch created class:', err)
          // Still close even if fetch fails
        }
      }
      fetchClass()
    }
    onClose()
  }


  const handleAddVideo = () => {
    if (!selectedVideoId) return

    // Check if video is already added (in pending or class videos)
    const isInPending = pendingVideos.some(pv => pv.video.video_id === selectedVideoId)
    const isInClassVideos = classVideos.some(cv => cv.video_id === selectedVideoId)
    
    if (isInPending || isInClassVideos) {
      setError('This video is already added to the class')
      return
    }

    // Find the video details
    const video = availableVideos.find(v => v.video_id === selectedVideoId)
    if (!video) {
      setError('Video not found')
      return
    }

    if (createdClassId) {
      // Class already exists, create the class video immediately
      handleAddVideoToClass(selectedVideoId, video)
    } else {
      // Class doesn't exist yet, add to pending videos
      setPendingVideos([...pendingVideos, { 
        video, 
        description: video.description || '' 
      }])
      setSelectedVideoId('')
    }
  }

  const handleAddVideoToClass = async (videoId: string, video: Video) => {
    if (!createdClassId) return

    try {
      const result = await createClassVideo({
        class_id: createdClassId,
        video_id: videoId,
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

  const handleRemoveVideo = (videoId: string, classVideoId?: string) => {
    if (!confirm('Are you sure you want to remove this video from the class?')) return

    if (classVideoId && createdClassId) {
      // Remove from database
      deleteClassVideo(classVideoId).then(result => {
        if (result.success) {
          setClassVideos(classVideos.filter(cv => cv.class_video_id !== classVideoId))
        } else {
          setError(result.error || 'Failed to remove video')
        }
      }).catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to remove video')
      })
    } else {
      // Remove from pending videos
      setPendingVideos(pendingVideos.filter(pv => pv.video.video_id !== videoId))
    }
  }

  const handleUpdateVideoDescription = async (videoId: string, classVideoId: string | undefined, description: string) => {
    if (classVideoId && createdClassId) {
      // Update in database
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
    } else {
      // Update in pending videos
      setPendingVideos(pendingVideos.map(pv => 
        pv.video.video_id === videoId 
          ? { ...pv, description }
          : pv
      ))
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

  // Filter out videos that are already added (in pending or class videos)
  const availableVideosToAdd = availableVideos.filter(
    video => 
      !pendingVideos.some(pv => pv.video.video_id === video.video_id) &&
      !classVideos.some(cv => cv.video_id === video.video_id)
  )

  // Combine pending videos and class videos for display
  const allVideos = [
    ...pendingVideos.map(pv => ({ 
      video: pv.video, 
      description: pv.description,
      isPending: true,
      video_id: pv.video.video_id,
    })),
    ...classVideos.map(cv => ({
      video: cv.video,
      description: cv.description,
      isPending: false,
      video_id: cv.video_id,
      class_video_id: cv.class_video_id,
    }))
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Class</DialogTitle>
          <DialogDescription>
            Create a new class and add videos (workouts) to it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
              <Label htmlFor="add-class-name">Class Name *</Label>
              <Input
                id="add-class-name"
                placeholder="Morning Pilates Flow"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description">Description *</Label>
              <Textarea
                id="add-description"
                placeholder="A relaxing morning pilates flow to start your day..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-instructor">Instructor *</Label>
              <Select
                value={formData.instructor_id}
                onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}
                disabled={isSubmitting || isLoadingInstructors || instructors.length === 0}
                required
              >
                <SelectTrigger id="add-instructor">
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
                <Label htmlFor="add-category">Category *</Label>
                <Select value="Pilates" disabled={true}>
                  <SelectTrigger id="add-category" className="bg-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pilates">Pilates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-level">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, level: value as typeof formData.level })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="add-level">
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
                <Label htmlFor="add-duration">Duration (minutes) *</Label>
                <Input
                  id="add-duration"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-intensity">Intensity Level *</Label>
                <Select
                  value={formData.intensity_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, intensity_level: value as typeof formData.intensity_level })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="add-intensity">
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
                <Label htmlFor="add-premium">Premium Class</Label>
                <Select
                  value={formData.is_premium ? 'true' : 'false'}
                  onValueChange={(value) => setFormData({ ...formData, is_premium: value === 'true' })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="add-premium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Free</SelectItem>
                    <SelectItem value="true">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-published">Published Status</Label>
                <Select
                  value={formData.is_published ? 'true' : 'false'}
                  onValueChange={(value) => setFormData({ ...formData, is_published: value === 'true' })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="add-published">
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
              <Label htmlFor="add-notes">Notes (Optional)</Label>
              <Textarea
                id="add-notes"
                placeholder="Additional notes about this class..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-banner">Banner Image (JPEG, PNG, or WebP)</Label>
              <div className="space-y-2">
                <Input
                  id="add-banner"
                  type="file"
                  accept=".jpeg,.jpg,.png,.webp,image/jpeg,image/png,image/webp"
                  ref={bannerInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedBanner(file)
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setBannerPreview(reader.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                />
                {bannerPreview && (
                  <div className="mt-2">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="max-w-full max-h-[200px] object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Challenge</Label>
              <RadioGroup
                value={formData.challenge ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, challenge: value === 'true' })}
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="add-challenge-false" />
                  <Label htmlFor="add-challenge-false" className="font-normal cursor-pointer">False</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="add-challenge-true" />
                  <Label htmlFor="add-challenge-true" className="font-normal cursor-pointer">True</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.challenge && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-badge">Badge Image (SVG, JPEG, or PNG)</Label>
                  <div className="space-y-2">
                    <Input
                      id="add-badge"
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
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-challenge-start-date">Start Challenge Date</Label>
                    <Input
                      id="add-challenge-start-date"
                      type="date"
                      value={formData.challenge_start_date}
                      onChange={(e) => setFormData({ ...formData, challenge_start_date: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="add-challenge-end-date">End Challenge Date</Label>
                    <Input
                      id="add-challenge-end-date"
                      type="date"
                      value={formData.challenge_end_date}
                      onChange={(e) => setFormData({ ...formData, challenge_end_date: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
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
                  disabled={isLoadingVideos || availableVideosToAdd.length === 0 || isSubmitting}
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
                  disabled={!selectedVideoId || isLoadingVideos || isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Videos List */}
            {isLoadingVideos ? (
              <p className="text-sm text-muted-foreground">Loading workouts...</p>
            ) : allVideos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No videos added yet. Add videos using the selector above.</p>
            ) : (
              <div className="space-y-4">
                {allVideos.map((item) => {
                  const video = item.video
                  const thumbnailUrl = getThumbnailUrl(video)
                  return (
                    <Card key={item.video_id} className="p-4">
                      <div className="flex gap-4">
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
                              value={item.description || ''}
                              onChange={(e) => {
                                if (item.isPending) {
                                  setPendingVideos(pendingVideos.map(pv => 
                                    pv.video.video_id === item.video_id 
                                      ? { ...pv, description: e.target.value }
                                      : pv
                                  ))
                                } else if ('class_video_id' in item) {
                                  setClassVideos(classVideos.map(cv => 
                                    cv.class_video_id === item.class_video_id 
                                      ? { ...cv, description: e.target.value }
                                      : cv
                                  ))
                                }
                              }}
                              onBlur={(e) => {
                                // Save to database on blur (only if class exists)
                                if (!item.isPending && 'class_video_id' in item && item.class_video_id) {
                                  handleUpdateVideoDescription(item.video_id, item.class_video_id, e.target.value)
                                }
                              }}
                              rows={2}
                              className="text-sm"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const classVideoId = 'class_video_id' in item ? item.class_video_id : undefined
                            handleRemoveVideo(item.video_id, classVideoId)
                          }}
                          className="text-destructive hover:text-destructive"
                          disabled={isSubmitting}
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
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {createdClassId ? 'Done' : 'Cancel'}
            </Button>
            {!createdClassId && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Class'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

