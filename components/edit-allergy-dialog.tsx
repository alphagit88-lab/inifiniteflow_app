'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateAllergy, type Allergy } from '@/app/actions/allergies'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface EditAllergyDialogProps {
  allergy: Allergy | null
  onClose: () => void
  onAllergyUpdated: (allergy: Allergy) => void
}

export function EditAllergyDialog({ allergy, onClose, onAllergyUpdated }: EditAllergyDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (allergy) {
      setFormData({
        name: allergy.name,
        description: allergy.description || '',
        is_active: allergy.is_active,
      })
      setError(null)
      setSuccess(false)
    }
  }, [allergy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allergy?.allergy_id) {
      setError('Allergy ID is missing')
      return
    }

    // Validation
    if (!formData.name.trim()) {
      setError('Please provide an allergy name.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateAllergy({
        allergy_id: allergy.allergy_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      })

      if (result.success && result.data) {
        setSuccess(true)
        setTimeout(() => {
          onAllergyUpdated(result.data!)
          onClose()
        }, 1000)
      } else {
        setError(result.error || 'Failed to update allergy')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!allergy) return null

  return (
    <Dialog open={!!allergy} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Allergy</DialogTitle>
          <DialogDescription>
            Update the allergy details.
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
              placeholder="Enter allergy name..."
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Must be unique</p>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
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
              <AlertDescription>Allergy updated successfully!</AlertDescription>
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

