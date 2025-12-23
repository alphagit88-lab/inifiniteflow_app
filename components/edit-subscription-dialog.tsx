'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateSubscription, type Subscription } from '@/app/actions/subscriptions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface EditSubscriptionDialogProps {
  subscription: Subscription | null
  onClose: () => void
  onSubscriptionUpdated: (subscription: Subscription) => void
}

export function EditSubscriptionDialog({ subscription, onClose, onSubscriptionUpdated }: EditSubscriptionDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tier_level: 1,
    duration_months: 1,
    price_usd: 0,
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        description: subscription.description || '',
        tier_level: subscription.tier_level,
        duration_months: subscription.duration_months,
        price_usd: subscription.price_usd,
        is_active: subscription.is_active,
      })
      setError(null)
      setSuccess(false)
    }
  }, [subscription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscription?.subscription_id) {
      setError('Subscription ID is missing')
      return
    }

    // Validation
    if (!formData.name.trim()) {
      setError('Please provide a subscription name.')
      return
    }

    if (formData.tier_level < 1) {
      setError('Tier level must be greater than 0.')
      return
    }

    if (formData.duration_months < 0) {
      setError('Duration must be 0 or greater.')
      return
    }

    if (formData.price_usd < 0) {
      setError('Price must be 0 or greater.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateSubscription({
        subscription_id: subscription.subscription_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        tier_level: formData.tier_level,
        duration_months: formData.duration_months,
        price_usd: formData.price_usd,
        is_active: formData.is_active,
      })

      if (result.success && result.data) {
        setSuccess(true)
        setTimeout(() => {
          onSubscriptionUpdated(result.data!)
          onClose()
        }, 1000)
      } else {
        setError(result.error || 'Failed to update subscription')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!subscription) return null

  return (
    <Dialog open={!!subscription} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update the subscription details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter subscription name..."
              disabled={isSubmitting}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter subscription description..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Tier Level Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-tier_level">Tier Level</Label>
            <Input
              id="edit-tier_level"
              type="number"
              min="1"
              value={formData.tier_level}
              onChange={(e) => setFormData({ ...formData, tier_level: parseInt(e.target.value) || 1 })}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Must be unique and greater than 0</p>
          </div>

          {/* Duration Months Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-duration_months">Duration (Months)</Label>
            <Input
              id="edit-duration_months"
              type="number"
              min="0"
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 0 })}
              disabled={isSubmitting}
            />
          </div>

          {/* Price USD Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-price_usd">Price (USD)</Label>
            <Input
              id="edit-price_usd"
              type="number"
              min="0"
              step="0.01"
              value={formData.price_usd}
              onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) || 0 })}
              disabled={isSubmitting}
            />
          </div>

          {/* Is Active Field */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={isSubmitting}
              className="h-4 w-4"
            />
            <Label htmlFor="edit-is_active">Active</Label>
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
              <AlertDescription>Subscription updated successfully!</AlertDescription>
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

