'use client'

import { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Loader2, FileText, User, Video } from 'lucide-react'

interface ViewClassNotesDialogProps {
  classId: string | null
  className: string
  open: boolean
  onClose: () => void
}

interface Note {
  note_id: string
  class_id: string
  video_id: string
  user_id: string
  note_content: string
  created_at: string
  updated_at: string
  is_archived: boolean
  user: {
    user_id: string
    nickname: string | null
    email: string | null
  } | null
  video: {
    video_id: string
    description: string | null
    meta_title: string | null
    thumbnail_url: string | null
    mux_playback_id: string | null
  } | null
}

export function ViewClassNotesDialog({ classId, className, open, onClose }: ViewClassNotesDialogProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    if (!classId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/classes/${classId}/notes`)
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load notes')
      }

      if (payload.data) {
        setNotes(payload.data)
      } else {
        setNotes([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes')
      setNotes([])
    } finally {
      setIsLoading(false)
    }
  }, [classId])

  useEffect(() => {
    if (open && classId) {
      fetchNotes()
    } else {
      setNotes([])
      setError(null)
    }
  }, [open, classId, fetchNotes])

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

  const getUserDisplayName = (note: Note) => {
    if (note.user?.nickname) {
      return note.user.nickname
    }
    if (note.user?.email) {
      return note.user.email.split('@')[0]
    }
    return 'Unknown User'
  }

  const getThumbnailUrl = (video: Note['video']): string | null => {
    if (!video) return null
    if (video.thumbnail_url) return video.thumbnail_url
    if (video.mux_playback_id) {
      return `https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?width=160&height=90&fit_mode=smartcrop`
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes for: {className}
          </DialogTitle>
          <DialogDescription>
            View all notes added by users for videos in this class
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading notes...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notes found for videos in this class.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const videoTitle = note.video?.meta_title || note.video?.description || 'Unknown Video'
              const isArchived = note.is_archived

              return (
                <Card
                  key={note.note_id}
                  className={`p-4 ${isArchived ? 'bg-gray-50 text-gray-500 opacity-70' : ''}`}
                >
                  <div className="space-y-3">
                    {/* Video Info */}
                    <div className="flex items-center gap-3 text-sm pb-2 border-b">
                      {getThumbnailUrl(note.video) && (
                        <div className="relative w-24 h-14 flex-shrink-0 rounded-md overflow-hidden border">
                          <img
                            src={getThumbnailUrl(note.video)!}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Video className={`h-4 w-4 flex-shrink-0 ${isArchived ? 'text-gray-400' : 'text-blue-600'}`} />
                        <span className={`font-medium truncate ${isArchived ? 'text-gray-500' : 'text-blue-700'}`}>
                          Video: {videoTitle}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <User className={`h-4 w-4 ${isArchived ? 'text-gray-400' : 'text-muted-foreground'}`} />
                      <span className={`font-semibold ${isArchived ? 'text-gray-500' : 'text-foreground'}`}>
                        {getUserDisplayName(note)}
                      </span>
                      {note.user?.email && (
                        <span className={`text-xs ${isArchived ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          ({note.user.email})
                        </span>
                      )}
                      {isArchived && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                          Archived
                        </span>
                      )}
                    </div>

                    {/* Note Content */}
                    <div className={`text-sm whitespace-pre-wrap ${isArchived ? 'text-gray-500' : 'text-foreground'}`}>
                      {note.note_content}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Created: {formatDate(note.created_at)}</span>
                      {note.updated_at !== note.created_at && (
                        <span>Updated: {formatDate(note.updated_at)}</span>
                      )}
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

