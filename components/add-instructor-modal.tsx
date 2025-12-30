'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Instructor } from '@/actions/instructors'
import { getUserProfiles } from '@/actions/profiles'
import { Plus, X } from 'lucide-react'

interface AddInstructorModalProps {
  open: boolean
  onClose: () => void
  onInstructorCreated: (instructor: Instructor) => void
}

export function AddInstructorModal({ open, onClose, onInstructorCreated }: AddInstructorModalProps) {
  const [formData, setFormData] = useState({
    instructor_id: '',
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
  const [availableUsers, setAvailableUsers] = useState<Array<{ user_id: string; email: string; nickname: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    if (open) {
      // Fetch available users (non-admin users)
      const fetchUsers = async () => {
        setIsLoadingUsers(true)
        try {
          const result = await getUserProfiles()
          if (result.success && result.data) {
            setAvailableUsers(
              result.data.map((user) => ({
                user_id: user.user_id || '',
                email: user.email,
                nickname: user.nickname || user.email,
              }))
            )
          }
        } catch (err) {
          console.error('Failed to load users:', err)
        } finally {
          setIsLoadingUsers(false)
        }
      }
      fetchUsers()
    } else {
      // Reset form when closing
      setFormData({
        instructor_id: '',
        bio: '',
        is_featured: false,
        years_experience: '',
        profile_video_url: '',
        rating: '',
        specialization: [],
        certifications: [],
      })
      setSpecializationInput('')
      setCertificationInput('')
      setError(null)
    }
  }, [open])

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

    if (!formData.instructor_id || !formData.bio.trim()) {
      setError('Instructor ID and bio are required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructor_id: formData.instructor_id,
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
        throw new Error(payload?.error || 'Failed to create instructor')
      }

      onInstructorCreated(payload.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create instructor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Instructor</DialogTitle>
          <DialogDescription>Create a new instructor profile with all the details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="instructor-id">Instructor (User) *</Label>
            <Select
              value={formData.instructor_id}
              onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}
              disabled={isSubmitting || isLoadingUsers}
            >
              <SelectTrigger id="instructor-id">
                <SelectValue placeholder={isLoadingUsers ? 'Loading users...' : 'Select a user'} />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.nickname} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
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
              <Label htmlFor="years-experience">Years of Experience</Label>
              <Input
                id="years-experience"
                type="number"
                min="0"
                placeholder="5"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
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
            <Label htmlFor="profile-video-url">Profile Video URL</Label>
            <Input
              id="profile-video-url"
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
            <Label htmlFor="featured">Featured Instructor</Label>
            <Select
              value={formData.is_featured ? 'true' : 'false'}
              onValueChange={(value) => setFormData({ ...formData, is_featured: value === 'true' })}
              disabled={isSubmitting}
            >
              <SelectTrigger id="featured">
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
              {isSubmitting ? 'Creating...' : 'Create Instructor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

