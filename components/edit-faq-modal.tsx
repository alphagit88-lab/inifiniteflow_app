'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { HelpFaq } from '@/app/actions/help-faq'

interface EditFaqModalProps {
  faq: HelpFaq | null
  onClose: () => void
  onFaqUpdated: (faq: HelpFaq) => void
}

export function EditFaqModal({ faq, onClose, onFaqUpdated }: EditFaqModalProps) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    is_published: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        is_published: faq.is_published,
      })
      setError(null)
    }
  }, [faq])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!faq?.id) {
      setError('FAQ ID is missing')
      return
    }

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
      const response = await fetch(`/api/faq/${faq.id}`, {
        method: 'PATCH',
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
        throw new Error(payload?.error || 'Failed to update FAQ')
      }

      onFaqUpdated(payload.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update FAQ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={Boolean(faq)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit FAQ</DialogTitle>
          <DialogDescription>Update the FAQ details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-faq-question">Question *</Label>
            <Input
              id="edit-faq-question"
              placeholder="Enter the question..."
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-faq-answer">Answer *</Label>
            <Textarea
              id="edit-faq-answer"
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
              <Label htmlFor="edit-faq-published">Published</Label>
              <p className="text-sm text-muted-foreground">Show this FAQ on the site</p>
            </div>
            <Switch
              id="edit-faq-published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              disabled={isSubmitting}
            />
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
