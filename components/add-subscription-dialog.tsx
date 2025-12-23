'use client'

import { useState, useRef } from 'react'
import { createSubscription } from '@/app/actions/subscriptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface AddSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubscriptionAdded?: () => void
}

export function AddSubscriptionDialog({ open, onOpenChange, onSubscriptionAdded }: AddSubscriptionDialogProps) {
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tier_level: 1,
      duration_months: 1,
      price_usd: 0,
      is_active: true,
    })
    setError(null)
    setSuccess(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      if (!newOpen && success) {
        resetForm()
        onSubscriptionAdded?.()
      }
      onOpenChange(newOpen)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const result = await createSubscription({
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
          resetForm()
          onSubscriptionAdded?.()
          onOpenChange(false)
        }, 1000)
      } else {
        setError(result.error || 'Failed to create subscription')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Subscription</DialogTitle>
          <DialogDescription>
            Create a new subscription plan. All fields will be saved to Supabase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter subscription name..."
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter subscription description..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Tier Level Field */}
          <div className="space-y-2">
            <Label htmlFor="tier_level">
              Tier Level <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tier_level"
              type="number"
              min="1"
              value={formData.tier_level}
              onChange={(e) => setFormData({ ...formData, tier_level: parseInt(e.target.value) || 1 })}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Must be unique and greater than 0</p>
          </div>

          {/* Duration Months Field */}
          <div className="space-y-2">
            <Label htmlFor="duration_months">
              Duration (Months) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="duration_months"
              type="number"
              min="0"
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 0 })}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Price USD Field */}
          <div className="space-y-2">
            <Label htmlFor="price_usd">
              Price (USD) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="price_usd"
              type="number"
              min="0"
              step="0.01"
              value={formData.price_usd}
              onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) || 0 })}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Is Active Field */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={isSubmitting}
              className="h-4 w-4"
            />
            <Label htmlFor="is_active">Active</Label>
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
              <AlertDescription>Subscription created successfully!</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Subscription'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

