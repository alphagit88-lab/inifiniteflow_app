'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Profile } from '@/actions/profiles'

interface AddUserModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUserCreated: (user: Profile) => void
}

const SUBSCRIPTION_OPTIONS = ['Active', 'Inactive', 'Pending'] as const

export function AddUserModal({ isOpen, onOpenChange, onUserCreated }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    subscriptionStatus: SUBSCRIPTION_OPTIONS[0],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nickname || !formData.email) {
      setError('Nickname and email are required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: formData.nickname,
          email: formData.email,
          subscription_status: formData.subscriptionStatus,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create user')
      }

      onUserCreated(payload.data)

      setFormData({
        nickname: '',
        email: '',
        subscriptionStatus: SUBSCRIPTION_OPTIONS[0],
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Button 
        onClick={() => onOpenChange(true)}
        className="w-full md:w-auto"
      >
        + Add New User
      </Button>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Fill in the user details below to add a new user to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname *</Label>
            <Input
              id="nickname"
              placeholder="student_123"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subscriptionStatus">Subscription Status</Label>
            <Select
              value={formData.subscriptionStatus}
              onValueChange={(value) => setFormData({ ...formData, subscriptionStatus: value as (typeof SUBSCRIPTION_OPTIONS)[number] })}
            >
              <SelectTrigger id="subscriptionStatus">
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
