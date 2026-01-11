'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { HelpFaq } from '@/app/actions/help-faq'

interface AddFaqModalProps {
  open: boolean
  onClose: () => void
  onFaqCreated: (faq: HelpFaq) => void
}

export function AddFaqModal({ open, onClose, onFaqCreated }: AddFaqModalProps) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    is_published: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.question.trim()) {
      setError('Question is required')
      return
    }

    if (!formData.answer.trim()) {
      setError('Answer is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          is_published: formData.is_published,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to create FAQ')
      }

      onFaqCreated(payload.data)
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create FAQ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      is_published: true,
    })
    setError(null)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add FAQ</DialogTitle>
          <DialogDescription>Create a new frequently asked question.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="faq-question">Question *</Label>
            <Input
              id="faq-question"
              placeholder="Enter the question..."
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faq-answer">Answer *</Label>
            <Textarea
              id="faq-answer"
              placeholder="Enter the answer..."
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              disabled={isSubmitting}
              rows={6}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="faq-published">Published</Label>
              <p className="text-sm text-muted-foreground">Show this FAQ on the site</p>
            </div>
            <Switch
              id="faq-published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create FAQ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
