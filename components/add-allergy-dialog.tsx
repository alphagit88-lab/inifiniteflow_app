'use client'

import { useState } from 'react'
import { createAllergy } from '@/app/actions/allergies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface AddAllergyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAllergyAdded?: () => void
}

export function AddAllergyDialog({ open, onOpenChange, onAllergyAdded }: AddAllergyDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
    })
    setError(null)
    setSuccess(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      if (!newOpen && success) {
        resetForm()
        onAllergyAdded?.()
      }
      onOpenChange(newOpen)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      setError('Please provide an allergy name.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await createAllergy({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      })

      if (result.success && result.data) {
        setSuccess(true)
        setTimeout(() => {
          resetForm()
          onAllergyAdded?.()
          onOpenChange(false)
        }, 1000)
      } else {
        setError(result.error || 'Failed to create allergy')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Allergy</DialogTitle>
          <DialogDescription>
            Create a new allergy. All fields will be saved to Supabase.
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
              placeholder="Enter allergy name (e.g., Peanuts, Milk, etc.)..."
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Must be unique</p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter allergy description..."
              rows={3}
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
              <AlertDescription>Allergy created successfully!</AlertDescription>
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
              {isSubmitting ? 'Creating...' : 'Create Allergy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

