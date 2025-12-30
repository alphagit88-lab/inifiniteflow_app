'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Image } from 'lucide-react'

interface ViewClassBannerDialogProps {
  classId: string | null
  className: string
  bannerImageUrl: string | null
  open: boolean
  onClose: () => void
}

export function ViewClassBannerDialog({ className, bannerImageUrl, open, onClose }: ViewClassBannerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Banner Image for: {className}
          </DialogTitle>
          <DialogDescription>
            View the banner image for this class
          </DialogDescription>
        </DialogHeader>

        {bannerImageUrl ? (
          <div className="flex items-center justify-center p-4">
            <img
              src={bannerImageUrl}
              alt={`Banner for ${className}`}
              className="max-w-full max-h-[70vh] object-contain rounded-md border"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No banner image available for this class.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

