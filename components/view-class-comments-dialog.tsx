'use client'

import { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, MessageSquare, User, Trash2, Eye, EyeOff } from 'lucide-react'

interface ViewClassCommentsDialogProps {
  classId: string | null
  className: string
  open: boolean
  onClose: () => void
}

interface Comment {
  comment_id: string
  class_id: string
  user_id: string
  comment_text: string
  created_at: string
  updated_at: string
  is_marked_hidden: boolean
  user: {
    user_id: string
    nickname: string | null
    email: string | null
  } | null
}

export function ViewClassCommentsDialog({ classId, className, open, onClose }: ViewClassCommentsDialogProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!classId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/classes/${classId}/comments`)
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load comments')
      }

      if (payload.data) {
        setComments(payload.data)
      } else {
        setComments([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments')
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    if (open && classId) {
      fetchComments()
    } else {
      setComments([])
      setError(null)
    }
  }, [open, classId, fetchComments])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUserDisplayName = (comment: Comment) => {
    if (comment.user?.nickname) {
      return comment.user.nickname
    }
    if (comment.user?.email) {
      return comment.user.email.split('@')[0]
    }
    return 'Unknown User'
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return
    }

    if (!classId) return

    setDeletingId(commentId)
    setError(null)

    try {
      const response = await fetch(`/api/classes/${classId}/comments/${commentId}`, {
        method: 'DELETE',
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete comment')
      }

      // Remove comment from local state
      setComments((prev) => prev.filter((c) => c.comment_id !== commentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete comment')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleHide = async (comment: Comment) => {
    if (!classId) return

    setUpdatingId(comment.comment_id)
    setError(null)

    try {
      const newHiddenState = !comment.is_marked_hidden

      const response = await fetch(`/api/classes/${classId}/comments/${comment.comment_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_marked_hidden: newHiddenState,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update comment')
      }

      // Update comment in local state
      setComments((prev) =>
        prev.map((c) =>
          c.comment_id === comment.comment_id
            ? { ...c, is_marked_hidden: newHiddenState, updated_at: payload.data?.updated_at || c.updated_at }
            : c
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update comment')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments for: {className}
          </DialogTitle>
          <DialogDescription>
            View all comments added by users for this class
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading comments...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments found for this class.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {comments.map((comment) => {
              const isHidden = comment.is_marked_hidden
              const isDeleting = deletingId === comment.comment_id
              const isUpdating = updatingId === comment.comment_id

              return (
                <Card
                  key={comment.comment_id}
                  className={`p-4 ${isHidden ? 'bg-gray-50 border-gray-200 opacity-75' : ''}`}
                >
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className={`h-4 w-4 ${isHidden ? 'text-gray-400' : 'text-muted-foreground'}`} />
                      <span className={`font-semibold ${isHidden ? 'text-gray-500' : 'text-foreground'}`}>
                        {getUserDisplayName(comment)}
                      </span>
                      {comment.user?.email && (
                        <span className={`text-xs ${isHidden ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          ({comment.user.email})
                        </span>
                      )}
                      {isHidden && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                          Hidden
                        </span>
                      )}
                    </div>

                    {/* Comment Text */}
                    <div className={`text-sm whitespace-pre-wrap ${isHidden ? 'text-gray-500' : 'text-foreground'}`}>
                      {comment.comment_text}
                    </div>

                    {/* Timestamp and Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created: {formatDate(comment.created_at)}</span>
                        {comment.updated_at !== comment.created_at && (
                          <span>Updated: {formatDate(comment.updated_at)}</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleHide(comment)}
                          disabled={isDeleting || isUpdating}
                          className={isHidden ? 'text-blue-600 hover:text-blue-700' : 'text-orange-600 hover:text-orange-700'}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : isHidden ? (
                            <Eye className="h-3 w-3 mr-1" />
                          ) : (
                            <EyeOff className="h-3 w-3 mr-1" />
                          )}
                          {isHidden ? 'Show' : 'Hide'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(comment.comment_id)}
                          disabled={isDeleting || isUpdating}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

