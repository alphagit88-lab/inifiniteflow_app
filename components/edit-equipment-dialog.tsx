'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateEquipment, type Equipment } from '@/app/actions/equipment'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface EditEquipmentDialogProps {
  equipment: Equipment | null
  onClose: () => void
  onEquipmentUpdated: (equipment: Equipment) => void
}

export function EditEquipmentDialog({ equipment, onClose, onEquipmentUpdated }: EditEquipmentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        description: equipment.description || '',
        is_active: equipment.is_active,
      })
      setError(null)
      setSuccess(false)
    }
  }, [equipment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipment?.equipment_id) {
      setError('Equipment ID is missing')
      return
    }

    // Validation
    if (!formData.name.trim()) {
      setError('Please provide an equipment name.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await updateEquipment({
        equipment_id: equipment.equipment_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_active: formData.is_active,
      })

      if (result.success && result.data) {
        setSuccess(true)
        setTimeout(() => {
          onEquipmentUpdated(result.data!)
          onClose()
        }, 1000)
      } else {
        setError(result.error || 'Failed to update equipment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!equipment) return null

  return (
    <Dialog open={!!equipment} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogDescription>
            Update the equipment details.
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
              placeholder="Enter equipment name..."
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
              placeholder="Enter equipment description..."
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
              <AlertDescription>Equipment updated successfully!</AlertDescription>
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

