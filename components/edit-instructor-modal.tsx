'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Instructor } from '@/actions/instructors'
import { Plus, X } from 'lucide-react'

interface EditInstructorModalProps {
  instructor: Instructor | null
  onClose: () => void
  onInstructorUpdated: (instructor: Instructor) => void
}

export function EditInstructorModal({ instructor, onClose, onInstructorUpdated }: EditInstructorModalProps) {
  const [formData, setFormData] = useState({
    bio: '',
    is_featured: false,
    years_experience: '',
    profile_video_url: '',
    rating: '',
    specialization: [] as string[],
    certifications: [] as string[],
  })
  const [specializationInput, setSpecializationInput] = useState('')
  const [certificationInput, setCertificationInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (instructor) {
      setFormData({
        bio: instructor.bio || '',
        is_featured: instructor.is_featured || false,
        years_experience: instructor.years_experience?.toString() || '',
        profile_video_url: instructor.profile_video_url || '',
        rating: instructor.rating?.toString() || '',
        specialization: instructor.specialization || [],
        certifications: instructor.certifications || [],
      })
      setSpecializationInput('')
      setCertificationInput('')
      setError(null)
    }
  }, [instructor])

  const handleAddSpecialization = () => {
    if (specializationInput.trim()) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, specializationInput.trim()],
      })
      setSpecializationInput('')
    }
  }

  const handleRemoveSpecialization = (index: number) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter((_, i) => i !== index),
    })
  }

  const handleAddCertification = () => {
    if (certificationInput.trim()) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, certificationInput.trim()],
      })
      setCertificationInput('')
    }
  }

  const handleRemoveCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!instructor?.instructor_id) {
      setError('Instructor ID is missing')
      return
    }

    if (!formData.bio.trim()) {
      setError('Bio is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/instructors/${instructor.instructor_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: formData.bio.trim(),
          is_featured: formData.is_featured,
          years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
          profile_video_url: formData.profile_video_url || null,
          rating: formData.rating ? parseFloat(formData.rating) : null,
          specialization: formData.specialization.length > 0 ? formData.specialization : null,
          certifications: formData.certifications.length > 0 ? formData.certifications : null,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update instructor')
      }

      onInstructorUpdated(payload.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update instructor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={Boolean(instructor)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Instructor</DialogTitle>
          <DialogDescription>Update the instructor details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio *</Label>
            <Textarea
              id="edit-bio"
              placeholder="Enter instructor biography..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-years-experience">Years of Experience</Label>
              <Input
                id="edit-years-experience"
                type="number"
                min="0"
                placeholder="5"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-rating">Rating</Label>
              <Input
                id="edit-rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-profile-video-url">Profile Video URL</Label>
            <Input
              id="edit-profile-video-url"
              type="url"
              placeholder="https://example.com/video.mp4"
              value={formData.profile_video_url}
              onChange={(e) => setFormData({ ...formData, profile_video_url: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Specializations</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add specialization..."
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSpecialization()
                  }
                }}
                disabled={isSubmitting}
              />
              <Button type="button" onClick={handleAddSpecialization} disabled={isSubmitting || !specializationInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.specialization.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-blue-100 text-blue-800"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(index)}
                      className="hover:text-blue-600"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add certification..."
                value={certificationInput}
                onChange={(e) => setCertificationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCertification()
                  }
                }}
                disabled={isSubmitting}
              />
              <Button type="button" onClick={handleAddCertification} disabled={isSubmitting || !certificationInput.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm bg-green-100 text-green-800"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertification(index)}
                      className="hover:text-green-600"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-featured">Featured Instructor</Label>
            <Select
              value={formData.is_featured ? 'true' : 'false'}
              onValueChange={(value) => setFormData({ ...formData, is_featured: value === 'true' })}
              disabled={isSubmitting}
            >
              <SelectTrigger id="edit-featured">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Regular</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
              </SelectContent>
            </Select>
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

