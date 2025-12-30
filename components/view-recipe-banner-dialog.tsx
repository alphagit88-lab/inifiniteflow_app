'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Image } from 'lucide-react'

interface ViewRecipeBannerDialogProps {
  recipeId: string | null
  recipeName: string
  bannerImageUrl: string | null
  open: boolean
  onClose: () => void
}

export function ViewRecipeBannerDialog({ recipeName, bannerImageUrl, open, onClose }: ViewRecipeBannerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Banner Image for: {recipeName}
          </DialogTitle>
          <DialogDescription>
            View the banner image for this recipe
          </DialogDescription>
        </DialogHeader>

        {bannerImageUrl ? (
          <div className="flex items-center justify-center p-4">
            <img
              src={bannerImageUrl}
              alt={`Banner for ${recipeName}`}
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
            <p>No banner image available for this recipe.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

