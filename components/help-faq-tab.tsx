'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { getHelpFaqs, type HelpFaq } from '@/app/actions/help-faq'
import { AddFaqModal } from '@/components/add-faq-modal'
import { EditFaqModal } from '@/components/edit-faq-modal'
import { Plus, GripVertical, Edit, Trash2, Loader2, HelpCircle } from 'lucide-react'

export function HelpFaqTab() {
  const [faqs, setFaqs] = useState<HelpFaq[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<HelpFaq | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchFaqs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getHelpFaqs()
      if (result.success && result.data) {
        setFaqs(result.data)
      } else {
        setError(result.error || 'Failed to load FAQs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load FAQs')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFaqs()
  }, [])

  const handleFaqCreated = (faq: HelpFaq) => {
    setFaqs([...faqs, faq])
  }

  const handleFaqUpdated = (updatedFaq: HelpFaq) => {
    setFaqs(faqs.map((f) => (f.id === updatedFaq.id ? updatedFaq : f)))
    setEditingFaq(null)
  }

  const handleDelete = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return
    }

    setDeletingId(faqId)
    try {
      const response = await fetch(`/api/faq/${faqId}`, {
        method: 'DELETE',
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete FAQ')
      }

      setFaqs(faqs.filter((f) => f.id !== faqId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete FAQ')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublished = async (faq: HelpFaq) => {
    setTogglingId(faq.id)
    try {
      const response = await fetch(`/api/faq/${faq.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !faq.is_published,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update FAQ')
      }

      setFaqs(faqs.map((f) => (f.id === faq.id ? payload.data : f)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update FAQ')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const draggedItem = faqs[draggedIndex]
    const newFaqs = [...faqs]

    // Remove dragged item from its original position
    newFaqs.splice(draggedIndex, 1)

    // Insert dragged item at new position
    newFaqs.splice(dropIndex, 0, draggedItem)

    // Update display_order for all items
    const updates = newFaqs.map((faq, index) => ({
      id: faq.id,
      display_order: index,
    }))

    setIsReordering(true)
    try {
      const response = await fetch('/api/faq/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ faqs: updates }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update FAQ order')
      }

      // Update local state with new order
      const updatedFaqs = newFaqs.map((faq, index) => ({
        ...faq,
        display_order: index,
      }))
      setFaqs(updatedFaqs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update FAQ order')
      // Revert by refetching
      fetchFaqs()
    } finally {
      setIsReordering(false)
      setDraggedIndex(null)
      setDragOverIndex(null)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Help FAQs</h2>
          <p className="text-muted-foreground">Manage frequently asked questions and their display order</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading FAQs...</span>
          </div>
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No FAQs found. Create your first FAQ to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq, index) => (
                <TableRow
                  key={faq.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-move transition-colors ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${dragOverIndex === index ? 'bg-muted' : ''}`}
                >
                  <TableCell>
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </TableCell>
                  <TableCell className="font-medium">{faq.display_order}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={faq.question}>
                      {faq.question}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={faq.answer}>
                      {faq.answer}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Badge variant={faq.is_published ? 'default' : 'secondary'}>
                        {faq.is_published ? 'Published' : 'Unpublished'}
                      </Badge>
                      <Switch
                        checked={faq.is_published}
                        onCheckedChange={() => handleTogglePublished(faq)}
                        disabled={togglingId === faq.id || isReordering}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFaq(faq)}
                        disabled={isReordering}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(faq.id)}
                        disabled={deletingId === faq.id || isReordering}
                      >
                        {deletingId === faq.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <AddFaqModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onFaqCreated={handleFaqCreated} />
      <EditFaqModal faq={editingFaq} onClose={() => setEditingFaq(null)} onFaqUpdated={handleFaqUpdated} />
    </div>
  )
}
