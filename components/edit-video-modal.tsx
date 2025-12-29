'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { updateVideo, uploadThumbnail, type Video } from '@/app/actions/mux'
import { getEquipment } from '@/app/actions/equipment'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface EditVideoModalProps {
  video: Video | null
  onClose: () => void
  onVideoUpdated: (video: Video) => void
}

export function EditVideoModal({ video, onClose, onVideoUpdated }: EditVideoModalProps) {
  const [formData, setFormData] = useState({
    description: '',
    status: 'Draft' as 'Draft' | 'Published',
    subscription_plan: 'free' as 'free' | 'premium',
    meta_title: '',
    meta_description: '',
    instructions: '',
    min_calories: '',
    max_calories: '',
  })
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [equipmentList, setEquipmentList] = useState<Array<{ equipment_id: string; name: string }>>([])
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([])
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  // Fetch equipment list on mount
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const result = await getEquipment()
        if (result.success && result.data) {
          // Only show active equipment
          const activeEquipment = result.data
            .filter(eq => eq.is_active)
            .map(eq => ({ equipment_id: eq.equipment_id, name: eq.name }))
          setEquipmentList(activeEquipment)
        }
      } catch (err) {
        console.error('Failed to fetch equipment:', err)
      }
    }
    fetchEquipment()
  }, [])

  useEffect(() => {
    if (video) {
      setFormData({
        description: video.description || '',
        status: video.status,
        subscription_plan: video.subscription_plan,
        meta_title: video.meta_title || '',
        meta_description: video.meta_description || '',
        instructions: video.instructions || '',
        min_calories: video.min_calories?.toString() || '',
        max_calories: video.max_calories?.toString() || '',
      })
      setSelectedThumbnail(null)
      setThumbnailPreview(video.thumbnail_url || null)
      setError(null)
      setSuccess(false)
      
      // Set selected equipments based on video.equipments array
      if (video.equipments && video.equipments.length > 0 && equipmentList.length > 0) {
        const selectedIds = equipmentList
          .filter(eq => video.equipments?.includes(eq.name))
          .map(eq => eq.equipment_id)
        setSelectedEquipments(selectedIds)
      } else {
        setSelectedEquipments([])
      }
    }
  }, [video, equipmentList])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for thumbnail.')
        return
      }
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('Thumbnail image size must be less than 5MB.')
        return
      }
      setSelectedThumbnail(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!video?.video_id) {
      setError('Video ID is missing')
      return
    }

    // Validate calorie range
    if (formData.min_calories && formData.max_calories) {
      const min = parseInt(formData.min_calories, 10)
      const max = parseInt(formData.max_calories, 10)
      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        setError('Calorie values must be valid positive numbers.')
        return
      }
      if (min > max) {
        setError('Min calories cannot be greater than max calories.')
        return
      }
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Upload thumbnail if a new one is selected
      let thumbnailUrl: string | null = video.thumbnail_url || null
      if (selectedThumbnail) {
        const thumbnailResult = await uploadThumbnail(selectedThumbnail, video.video_id)
        if (thumbnailResult.success && thumbnailResult.url) {
          thumbnailUrl = thumbnailResult.url
        } else {
          setError(thumbnailResult.error || 'Failed to upload thumbnail')
          setIsSubmitting(false)
          return
        }
      }

      // Prepare equipment names array
      const equipmentNames = selectedEquipments
        .map(id => equipmentList.find(eq => eq.equipment_id === id)?.name)
        .filter((name): name is string => name !== undefined)

      const result = await updateVideo({
        video_id: video.video_id,
        description: formData.description.trim() || null,
        status: formData.status,
        subscription_plan: formData.subscription_plan,
        meta_title: formData.meta_title.trim() || null,
        meta_description: formData.meta_description.trim() || null,
        thumbnail_url: thumbnailUrl,
        equipments: equipmentNames.length > 0 ? equipmentNames : null,
        instructions: formData.instructions.trim() || null,
        min_calories: formData.min_calories ? parseInt(formData.min_calories, 10) : null,
        max_calories: formData.max_calories ? parseInt(formData.max_calories, 10) : null,
      })

      if (result.success && result.data) {
        setSuccess(true)
        setTimeout(() => {
          onVideoUpdated(result.data!)
          onClose()
        }, 1000)
      } else {
        setError(result.error || 'Failed to update video')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!video) return null

  return (
    <Dialog open={!!video} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
          <DialogDescription>
            Update the video metadata. Note: You cannot change the video file itself.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter video description..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'Draft' | 'Published') =>
                setFormData({ ...formData, status: value })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="edit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Plan Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-subscription-plan">Subscription Plan</Label>
            <Select
              value={formData.subscription_plan}
              onValueChange={(value: 'free' | 'premium') =>
                setFormData({ ...formData, subscription_plan: value })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="edit-subscription-plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meta Title Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-meta-title">Meta Title</Label>
            <Input
              id="edit-meta-title"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Enter meta title for SEO..."
              disabled={isSubmitting}
            />
          </div>

          {/* Meta Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-meta-description">Meta Description</Label>
            <Textarea
              id="edit-meta-description"
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              placeholder="Enter meta description for SEO..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Equipment Multiselect */}
          <div className="space-y-2">
            <Label>Equipment</Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
              {equipmentList.length === 0 ? (
                <p className="text-sm text-muted-foreground">No equipment available</p>
              ) : (
                <div className="space-y-2">
                  {equipmentList.map((equipment) => (
                    <div key={equipment.equipment_id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-equipment-${equipment.equipment_id}`}
                        checked={selectedEquipments.includes(equipment.equipment_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEquipments([...selectedEquipments, equipment.equipment_id])
                          } else {
                            setSelectedEquipments(selectedEquipments.filter(id => id !== equipment.equipment_id))
                          }
                        }}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`edit-equipment-${equipment.equipment_id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {equipment.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedEquipments.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedEquipments.length} equipment selected
              </p>
            )}
          </div>

          {/* Instructions Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-instructions">Instructions</Label>
            <Textarea
              id="edit-instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Enter detailed video instructions..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {/* Calorie Range */}
          <div className="space-y-2">
            <Label>Calorie Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-min-calories" className="text-sm">Min Calories</Label>
                <Input
                  id="edit-min-calories"
                  type="number"
                  min="0"
                  value={formData.min_calories}
                  onChange={(e) => setFormData({ ...formData, min_calories: e.target.value })}
                  placeholder="0"
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-max-calories" className="text-sm">Max Calories</Label>
                <Input
                  id="edit-max-calories"
                  type="number"
                  min="0"
                  value={formData.max_calories}
                  onChange={(e) => setFormData({ ...formData, max_calories: e.target.value })}
                  placeholder="0"
                  disabled={isSubmitting}
                  className="w-full"
                />
              </div>
            </div>
            {formData.min_calories && formData.max_calories && parseInt(formData.min_calories, 10) > parseInt(formData.max_calories, 10) && (
              <p className="text-xs text-destructive">
                Min calories cannot be greater than max calories
              </p>
            )}
          </div>

          {/* Thumbnail Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-thumbnail-file">Thumbnail Image</Label>
            <input
              ref={thumbnailInputRef}
              id="edit-thumbnail-file"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {thumbnailPreview && (
              <div className="relative w-full max-w-xs">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-auto rounded-md border"
                />
              </div>
            )}
            {!thumbnailPreview && video.thumbnail_url && (
              <div className="relative w-full max-w-xs">
                <img
                  src={video.thumbnail_url}
                  alt="Current thumbnail"
                  className="w-full h-auto rounded-md border"
                />
              </div>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Video updated successfully!</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
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

