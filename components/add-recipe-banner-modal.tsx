'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { RecipeBanner } from '@/app/actions/recipe-banners'
import { uploadBannerImage } from '@/app/actions/banner-images'

interface AddRecipeBannerModalProps {
  open: boolean
  onClose: () => void
  onBannerCreated: (banner: RecipeBanner) => void
}

export function AddRecipeBannerModal({ open, onClose, onBannerCreated }: AddRecipeBannerModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    is_active: true,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedImage) {
      setError('Please select an image')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Upload image first
      const uploadResult = await uploadBannerImage(selectedImage)
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Failed to upload image')
      }

      // Create banner with uploaded image URL
      const response = await fetch('/api/recipe-banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: uploadResult.url,
          title: formData.title.trim() || null,
          subtitle: formData.subtitle.trim() || null,
          is_active: formData.is_active,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create banner')
      }

      onBannerCreated(payload.data)
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create banner')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      is_active: true,
    })
    setSelectedImage(null)
    setImagePreview(null)
    setError(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Recipe Banner</DialogTitle>
          <DialogDescription>Create a new recipe banner with image, title, and subtitle.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipe-banner-image">Banner Image *</Label>
            <Input
              id="recipe-banner-image"
              type="file"
              accept=".jpeg,.jpg,.png,.webp,image/jpeg,image/png,image/webp"
              ref={imageInputRef}
              onChange={handleImageChange}
              disabled={isSubmitting}
              className="cursor-pointer"
              required
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="max-w-full max-h-[300px] object-contain border rounded-md"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipe-banner-title">Title (Optional)</Label>
            <Input
              id="recipe-banner-title"
              placeholder="Enter banner title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipe-banner-subtitle">Subtitle (Optional)</Label>
            <Input
              id="recipe-banner-subtitle"
              placeholder="Enter banner subtitle..."
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="recipe-banner-active">Active</Label>
              <p className="text-sm text-muted-foreground">Show this banner on the site</p>
            </div>
            <Switch
              id="recipe-banner-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

