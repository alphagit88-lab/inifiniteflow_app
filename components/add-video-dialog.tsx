'use client'

import { useState, useRef, useEffect } from 'react'
import { getMuxUploadUrl, checkAndUpdateVideoPlaybackId, checkAndUpdateVideoPlaybackIdByAsset, uploadThumbnail, updateVideo, importVideoFromUrl } from '@/app/actions/mux'
import { getEquipment } from '@/app/actions/equipment'
import { UpChunk } from '@mux/upchunk'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Upload } from 'lucide-react'

interface AddVideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVideoAdded?: () => void
}

type UploadMethod = 'file' | 'url'

export function AddVideoDialog({ open, onOpenChange, onVideoAdded }: AddVideoDialogProps) {
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('file')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft')
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'premium'>('free')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [equipmentList, setEquipmentList] = useState<Array<{ equipment_id: string; name: string }>>([])
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([])
  const [instructions, setInstructions] = useState('')
  const [minCalories, setMinCalories] = useState<string>('')
  const [maxCalories, setMaxCalories] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const resetForm = () => {
    setUploadMethod('file')
    setDescription('')
    setStatus('Draft')
    setSubscriptionPlan('free')
    setMetaTitle('')
    setMetaDescription('')
    setSelectedFile(null)
    setVideoUrl('')
    setSelectedThumbnail(null)
    setThumbnailPreview(null)
    setUploadProgress(0)
    setMessage(null)
    setSelectedEquipments([])
    setInstructions('')
    setMinCalories('')
    setMaxCalories('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUploading) {
      if (!newOpen && message?.type === 'success') {
        resetForm()
        onVideoAdded?.()
      }
      onOpenChange(newOpen)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setMessage({ type: 'error', text: 'Please select a valid video file.' })
        return
      }
      setSelectedFile(file)
      setMessage(null)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file for thumbnail.' })
        return
      }
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setMessage({ type: 'error', text: 'Thumbnail image size must be less than 5MB.' })
        return
      }
      setSelectedThumbnail(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setMessage(null)
    }
  }

  // Poll Mux API to check if video is ready and update playback ID (by upload ID for file uploads)
  const pollForPlaybackId = async (muxUploadId: string, attempt = 1, maxAttempts = 30) => {
    if (attempt > maxAttempts) {
      setMessage({
        type: 'success',
        text: 'Upload complete! Video is processing. Playback ID will be available shortly.',
      })
      setTimeout(() => {
        resetForm()
        onVideoAdded?.()
        onOpenChange(false)
      }, 2000)
      return
    }

    try {
      const result = await checkAndUpdateVideoPlaybackId(muxUploadId)

      if (result.success && result.isReady) {
        // Video is ready! Refresh the list
        setMessage({
          type: 'success',
          text: 'Upload complete! Video is ready to play.',
        })
        // Trigger refresh of video list
        onVideoAdded?.()
        setTimeout(() => {
          resetForm()
          onOpenChange(false)
        }, 1500)
      } else if (result.success && !result.isReady) {
        // Not ready yet, poll again after delay
        setMessage({
          type: 'success',
          text: `Upload complete! Processing video... (${attempt}/${maxAttempts})`,
        })
        // Poll every 5 seconds, up to 30 times (2.5 minutes total)
        setTimeout(() => {
          pollForPlaybackId(muxUploadId, attempt + 1, maxAttempts)
        }, 5000)
      } else {
        // Error occurred, but don't fail the upload
        console.error('Error checking playback ID:', result.error)
        setMessage({
          type: 'success',
          text: 'Upload complete! Video is processing. Playback ID will be available shortly.',
        })
        setTimeout(() => {
          resetForm()
          onVideoAdded?.()
          onOpenChange(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Error polling for playback ID:', error)
      setMessage({
        type: 'success',
        text: 'Upload complete! Video is processing. Playback ID will be available shortly.',
      })
      setTimeout(() => {
        resetForm()
        onVideoAdded?.()
        onOpenChange(false)
      }, 2000)
    }
  }

  // Poll Mux API to check if video is ready and update playback ID (by asset ID for URL imports)
  const pollForPlaybackIdByAsset = async (muxAssetId: string, videoId: string, attempt = 1, maxAttempts = 30) => {
    if (attempt > maxAttempts) {
      setMessage({
        type: 'success',
        text: 'Video imported! Processing may take a while. Playback ID will be available shortly.',
      })
      setTimeout(() => {
        resetForm()
        onVideoAdded?.()
        onOpenChange(false)
      }, 2000)
      return
    }

    try {
      const result = await checkAndUpdateVideoPlaybackIdByAsset(muxAssetId, videoId)

      if (result.success && result.isReady) {
        // Video is ready! Refresh the list
        setMessage({
          type: 'success',
          text: 'Video imported! Video is ready to play.',
        })
        onVideoAdded?.()
        setTimeout(() => {
          resetForm()
          onOpenChange(false)
        }, 1500)
      } else if (result.success && !result.isReady) {
        // Not ready yet, poll again after delay
        setMessage({
          type: 'success',
          text: `Video imported! Processing... (${attempt}/${maxAttempts})`,
        })
        // Poll every 5 seconds, up to 30 times (2.5 minutes total)
        setTimeout(() => {
          pollForPlaybackIdByAsset(muxAssetId, videoId, attempt + 1, maxAttempts)
        }, 5000)
      } else {
        // Error occurred, but don't fail the import
        console.error('Error checking asset status:', result.error)
        setMessage({
          type: 'success',
          text: 'Video imported! Processing may take a while. Playback ID will be available shortly.',
        })
        setTimeout(() => {
          resetForm()
          onVideoAdded?.()
          onOpenChange(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Error polling for asset status:', error)
      setMessage({
        type: 'success',
        text: 'Video imported! Processing may take a while. Playback ID will be available shortly.',
      })
      setTimeout(() => {
        resetForm()
        onVideoAdded?.()
        onOpenChange(false)
      }, 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please provide a description.' })
      return
    }

    if (uploadMethod === 'file' && !selectedFile) {
      setMessage({ type: 'error', text: 'Please select a video file to upload.' })
      return
    }

    if (uploadMethod === 'url' && !videoUrl.trim()) {
      setMessage({ type: 'error', text: 'Please provide a video URL.' })
      return
    }

    // Validate calorie range
    if (minCalories && maxCalories) {
      const min = parseInt(minCalories, 10)
      const max = parseInt(maxCalories, 10)
      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        setMessage({ type: 'error', text: 'Calorie values must be valid positive numbers.' })
        return
      }
      if (min > max) {
        setMessage({ type: 'error', text: 'Min calories cannot be greater than max calories.' })
        return
      }
    }

    if (uploadMethod === 'url') {
      // Validate URL format
      try {
        const url = new URL(videoUrl.trim())
        // Check if it's http or https
        if (!['http:', 'https:'].includes(url.protocol)) {
          setMessage({ type: 'error', text: 'URL must use HTTP or HTTPS protocol.' })
          return
        }
      } catch {
        setMessage({ type: 'error', text: 'Please provide a valid URL.' })
        return
      }
    }

    setIsUploading(true)
    setUploadProgress(0)
    setMessage(null)

    try {
    if (uploadMethod === 'url') {
      // Handle URL upload
        setMessage({
          type: 'success',
          text: 'Importing video from URL...',
        })

        // Prepare equipment names array
        const equipmentNames = selectedEquipments
          .map(id => equipmentList.find(eq => eq.equipment_id === id)?.name)
          .filter((name): name is string => name !== undefined)

        // Step 1: Import video from URL
        const result = await importVideoFromUrl({
          description: description.trim(),
          status,
          subscription_plan: subscriptionPlan,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          video_url: videoUrl.trim(),
          equipments: equipmentNames.length > 0 ? equipmentNames : null,
          instructions: instructions.trim() || null,
          min_calories: minCalories ? parseInt(minCalories, 10) : null,
          max_calories: maxCalories ? parseInt(maxCalories, 10) : null,
        })

        if (!result.success || !result.videoId) {
          throw new Error(result.error || 'Failed to import video from URL')
        }

        // Step 2: Upload thumbnail if provided
        if (selectedThumbnail) {
          const thumbnailResult = await uploadThumbnail(selectedThumbnail, result.videoId)
          if (thumbnailResult.success && thumbnailResult.url) {
            await updateVideo({
              video_id: result.videoId,
              thumbnail_url: thumbnailResult.url,
            })
          } else {
            console.warn('Failed to upload thumbnail:', thumbnailResult.error)
          }
        }

        setUploadProgress(100)
        setMessage({
          type: 'success',
          text: 'Video imported successfully! Processing...',
        })
        setIsUploading(false)

        // For URL imports, we already have the asset ID, so poll by asset ID
        // result.uploadId is actually the asset ID for URL imports
        if (result.uploadId && result.videoId) {
          pollForPlaybackIdByAsset(result.uploadId, result.videoId)
        } else {
          setTimeout(() => {
            resetForm()
            onVideoAdded?.()
            onOpenChange(false)
          }, 2000)
        }
      } else {
        // Handle file upload (existing logic)
        // Prepare equipment names array
        const equipmentNames = selectedEquipments
          .map(id => equipmentList.find(eq => eq.equipment_id === id)?.name)
          .filter((name): name is string => name !== undefined)

        // Step 1: Get Mux upload URL from server action (creates video record)
      const result = await getMuxUploadUrl({
        description: description.trim(),
        status,
        subscription_plan: subscriptionPlan,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          equipments: equipmentNames.length > 0 ? equipmentNames : null,
          instructions: instructions.trim() || null,
          min_calories: minCalories ? parseInt(minCalories, 10) : null,
          max_calories: maxCalories ? parseInt(maxCalories, 10) : null,
      })

        if (!result.success || !result.uploadUrl || !result.videoId) {
        throw new Error(result.error || 'Failed to get upload URL')
      }

        // Step 2: Upload thumbnail if provided
        if (selectedThumbnail) {
          const thumbnailResult = await uploadThumbnail(selectedThumbnail, result.videoId)
          if (thumbnailResult.success && thumbnailResult.url) {
            await updateVideo({
              video_id: result.videoId,
              thumbnail_url: thumbnailResult.url,
            })
          } else {
            console.warn('Failed to upload thumbnail:', thumbnailResult.error)
          }
        }

        // Step 3: Upload file to Mux using UpChunk
      const upload = UpChunk.createUpload({
        endpoint: result.uploadUrl,
          file: selectedFile!,
        chunkSize: 5120, // 5MB chunks
      })

      // Handle upload progress
      upload.on('progress', (progress: { detail: number }) => {
        const percent = Math.round(progress.detail)
        setUploadProgress(percent)
      })

      // Handle upload success
      upload.on('success', async () => {
        setUploadProgress(100)
        setMessage({
          type: 'success',
          text: 'Upload complete! Checking video status...',
        })
        setIsUploading(false)

        // Start polling for playback ID
        if (result.uploadId) {
          pollForPlaybackId(result.uploadId)
        } else {
          setTimeout(() => {
            resetForm()
            onVideoAdded?.()
            onOpenChange(false)
          }, 2000)
        }
      })

      // Handle upload error
        upload.on('error', (event: CustomEvent) => {
          const error = event.detail as Error
        console.error('Upload error:', error)
        setMessage({
          type: 'error',
            text: `Upload failed: ${error?.message || 'An unknown error occurred'}`,
        })
        setIsUploading(false)
        setUploadProgress(0)
      })
      }
    } catch (error) {
      console.error('Error during upload process:', error)
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a video to Mux for processing and hosting. All metadata will be saved to Supabase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description..."
              required
              disabled={isUploading}
              rows={4}
              className="w-full"
            />
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value: 'Draft' | 'Published') => setStatus(value)}
              disabled={isUploading}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscription Plan Field */}
          <div className="space-y-2">
            <Label htmlFor="subscription-plan">
              Subscription Plan <span className="text-destructive">*</span>
            </Label>
            <Select
              value={subscriptionPlan}
              onValueChange={(value: 'free' | 'premium') => setSubscriptionPlan(value)}
              disabled={isUploading}
            >
              <SelectTrigger id="subscription-plan" className="w-full">
                <SelectValue placeholder="Select subscription plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meta Title Field */}
          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Enter meta title for SEO..."
              disabled={isUploading}
              className="w-full"
            />
          </div>

          {/* Meta Description Field */}
          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Enter meta description for SEO..."
              disabled={isUploading}
              rows={3}
              className="w-full"
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
                        id={`equipment-${equipment.equipment_id}`}
                        checked={selectedEquipments.includes(equipment.equipment_id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEquipments([...selectedEquipments, equipment.equipment_id])
                          } else {
                            setSelectedEquipments(selectedEquipments.filter(id => id !== equipment.equipment_id))
                          }
                        }}
                        disabled={isUploading}
                      />
                      <Label
                        htmlFor={`equipment-${equipment.equipment_id}`}
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
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter detailed video instructions..."
              disabled={isUploading}
              rows={4}
              className="w-full"
            />
          </div>

          {/* Calorie Range */}
          <div className="space-y-2">
            <Label>Calorie Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-calories" className="text-sm">Min Calories</Label>
                <Input
                  id="min-calories"
                  type="number"
                  min="0"
                  value={minCalories}
                  onChange={(e) => setMinCalories(e.target.value)}
                  placeholder="0"
                  disabled={isUploading}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-calories" className="text-sm">Max Calories</Label>
                <Input
                  id="max-calories"
                  type="number"
                  min="0"
                  value={maxCalories}
                  onChange={(e) => setMaxCalories(e.target.value)}
                  placeholder="0"
                  disabled={isUploading}
                  className="w-full"
                />
              </div>
            </div>
            {minCalories && maxCalories && parseInt(minCalories, 10) > parseInt(maxCalories, 10) && (
              <p className="text-xs text-destructive">
                Min calories cannot be greater than max calories
              </p>
            )}
          </div>

          {/* Thumbnail Input */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail-file">Thumbnail Image</Label>
            <input
              ref={thumbnailInputRef}
              id="thumbnail-file"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              disabled={isUploading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {selectedThumbnail && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedThumbnail.name} ({(selectedThumbnail.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                {thumbnailPreview && (
                  <div className="relative w-full max-w-xs">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-auto rounded-md border"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Method Selection */}
          <div className="space-y-2">
            <Label>Upload Method</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="file"
                  checked={uploadMethod === 'file'}
                  onChange={(e) => {
                    setUploadMethod(e.target.value as UploadMethod)
                    setSelectedFile(null)
                    setVideoUrl('')
                    setMessage(null)
                  }}
                  disabled={isUploading}
                  className="w-4 h-4"
                />
                <span>Upload Video File</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadMethod"
                  value="url"
                  checked={uploadMethod === 'url'}
                  onChange={(e) => {
                    setUploadMethod(e.target.value as UploadMethod)
                    setSelectedFile(null)
                    setVideoUrl('')
                    setMessage(null)
                  }}
                  disabled={isUploading}
                  className="w-4 h-4"
                />
                <span>Upload via Link</span>
              </label>
            </div>
          </div>

          {/* File Input - shown only when uploadMethod is 'file' */}
          {uploadMethod === 'file' && (
          <div className="space-y-2">
            <Label htmlFor="video-file">
              Video File <span className="text-destructive">*</span>
            </Label>
            <input
              ref={fileInputRef}
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          )}

          {/* URL Input - shown only when uploadMethod is 'url' */}
          {uploadMethod === 'url' && (
            <div className="space-y-2">
              <Label htmlFor="video-url">
                Video URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                disabled={isUploading}
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter a publicly accessible video URL (e.g., https://example.com/video.mp4). 
                The video must be directly downloadable without authentication or login.
              </p>
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <p className="font-medium mb-1">Note:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>URL must be publicly accessible (no login required)</li>
                  <li>Direct link to video file (not a page with embedded video)</li>
                  <li>Supported formats: MP4, MOV, AVI, WebM, etc.</li>
                  <li>Some file sharing services may require direct download links</li>
                </ul>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Message Alert */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isUploading ||
                !description.trim() ||
                (uploadMethod === 'file' && !selectedFile) ||
                (uploadMethod === 'url' && !videoUrl.trim())
              }
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

