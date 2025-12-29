'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Profile } from '@/actions/profiles'

const SUBSCRIPTION_OPTIONS = ['Active', 'Inactive', 'Pending'] as const

type EditableProfile = Pick<Profile, 'user_id' | 'nickname' | 'email' | 'user_type' | 'subscription_status'>

interface EditUserModalProps {
  user: EditableProfile | null
  onClose: () => void
  onUserUpdated: (user: Profile) => void
}

export function EditUserModal({ user, onClose, onUserUpdated }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    subscriptionStatus: SUBSCRIPTION_OPTIONS[0],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname,
        email: user.email,
        subscriptionStatus: SUBSCRIPTION_OPTIONS.includes(user.subscription_status as any)
          ? user.subscription_status as (typeof SUBSCRIPTION_OPTIONS)[number]
          : SUBSCRIPTION_OPTIONS[0],
      })
      setError(null)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.user_id) {
      setError('User ID is missing')
      return
    }

    if (!formData.nickname.trim() || !formData.email.trim()) {
      setError('Nickname and email are required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${user.user_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: formData.nickname.trim(),
          email: formData.email.trim(),
          subscription_status: formData.subscriptionStatus,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update user')
      }

      onUserUpdated(payload.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update the user’s details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-nickname">Nickname *</Label>
            <Input
              id="edit-nickname"
              placeholder="student_123"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email *</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-subscription">Subscription Status</Label>
            <Select
              value={formData.subscriptionStatus}
              onValueChange={(value) =>
                setFormData({ ...formData, subscriptionStatus: value as (typeof SUBSCRIPTION_OPTIONS)[number] })
              }
            >
              <SelectTrigger id="edit-subscription">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
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

