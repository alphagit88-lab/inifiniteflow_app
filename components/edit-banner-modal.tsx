'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ClassBanner } from '@/app/actions/banners'
import { uploadBannerImage } from '@/app/actions/banner-images'

interface EditBannerModalProps {
  banner: ClassBanner | null
  onClose: () => void
  onBannerUpdated: (banner: ClassBanner) => void
}

export function EditBannerModal({ banner, onClose, onBannerUpdated }: EditBannerModalProps) {
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

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        is_active: banner.is_active,
      })
      setImagePreview(banner.image_url)
      setSelectedImage(null)
      setError(null)
    }
  }, [banner])

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

    if (!banner?.banner_id) {
      setError('Banner ID is missing')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let imageUrl = banner.image_url

      // Upload new image if selected
      if (selectedImage) {
        const uploadResult = await uploadBannerImage(selectedImage)
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || 'Failed to upload image')
        }
        imageUrl = uploadResult.url
      }

      // Update banner
      const response = await fetch(`/api/banners/${banner.banner_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          title: formData.title.trim() || null,
          subtitle: formData.subtitle.trim() || null,
          is_active: formData.is_active,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update banner')
      }

      onBannerUpdated(payload.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update banner')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={Boolean(banner)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Banner</DialogTitle>
          <DialogDescription>Update the banner details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-banner-image">Banner Image</Label>
            <Input
              id="edit-banner-image"
              type="file"
              accept=".jpeg,.jpg,.png,.webp,image/jpeg,image/png,image/webp"
              ref={imageInputRef}
              onChange={handleImageChange}
              disabled={isSubmitting}
              className="cursor-pointer"
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
            <Label htmlFor="edit-banner-title">Title (Optional)</Label>
            <Input
              id="edit-banner-title"
              placeholder="Enter banner title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-banner-subtitle">Subtitle (Optional)</Label>
            <Input
              id="edit-banner-subtitle"
              placeholder="Enter banner subtitle..."
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="edit-banner-active">Active</Label>
              <p className="text-sm text-muted-foreground">Show this banner on the site</p>
            </div>
            <Switch
              id="edit-banner-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isSubmitting}
            />
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

