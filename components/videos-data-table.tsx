'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { Video, getVideos, deleteVideo } from '@/app/actions/mux'
import { EditVideoModal } from './edit-video-modal'
import { VideoPlayerModal } from './video-player-modal'
import { ExternalLink, Edit, Plus, Play, Trash2, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const ITEMS_PER_PAGE = 10

export function VideosDataTable({ initialVideos = [], refreshKey = 0 }: { initialVideos: Video[], refreshKey?: number }) {
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(initialVideos.length === 0)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [viewingVideo, setViewingVideo] = useState<Video | null>(null)
  const [deletingVideo, setDeletingVideo] = useState<Video | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch data when component mounts or when refreshKey changes
  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoading(true)
      setError(null)
      try {
        const result = await getVideos()
        if (result.success && result.data) {
          setVideos(result.data)
        } else if (result.error) {
          setError('Failed to load videos: ' + result.error)
        }
      } catch (e) {
        setError('An unexpected error occurred during client-side fetch.')
      } finally {
        setIsInitialLoading(false)
      }
    }

    // Always fetch to get latest data, especially when refreshKey changes
    fetchData()
  }, [refreshKey])

  const filteredVideos = useMemo(() => {
    return videos.filter(
      (video) =>
        video.video_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        video.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.subscription_plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.meta_title?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (video.meta_description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        (video.equipments?.some(eq => eq.toLowerCase().includes(searchTerm.toLowerCase())) || false) ||
        (video.instructions?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    )
  }, [videos, searchTerm])

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE)
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredVideos.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredVideos, currentPage])

  const handleVideoUpdated = (updatedVideo: Video) => {
    setVideos((prev) =>
      prev.map((v) => (v.video_id === updatedVideo.video_id ? updatedVideo : v))
    )
    setEditingVideo(null)
  }

  const handleDeleteClick = (video: Video) => {
    setDeletingVideo(video)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingVideo) return

    setIsDeleting(true)
    try {
      const result = await deleteVideo(deletingVideo.video_id)
      if (result.success) {
        // Remove the video from the list
        setVideos((prev) => prev.filter((v) => v.video_id !== deletingVideo.video_id))
        setDeletingVideo(null)
      } else {
        alert('Failed to delete video: ' + result.error)
      }
    } catch (err) {
      alert('An unexpected error occurred while deleting the video.')
      console.error('Delete error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyVideoId = async (videoId: string) => {
    try {
      await navigator.clipboard.writeText(videoId)
      setCopiedVideoId(videoId)
      toast({
        title: 'Copied!',
        description: 'Video ID copied to clipboard',
      })
      setTimeout(() => setCopiedVideoId(null), 2000)
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy Video ID to clipboard',
        variant: 'destructive',
      })
    }
  }

  const getThumbnailUrl = (video: Video): string | null => {
    if (video.mux_playback_id) {
      return `https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop`
    }
    return null
  }

  if (isInitialLoading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Loading videos...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search videos by ID, description, meta title, meta description, status, or plan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-sm"
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Video ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Meta Title</TableHead>
              <TableHead>Meta Description</TableHead>
              <TableHead>Equipment</TableHead>
              <TableHead>Instructions</TableHead>
              <TableHead>Calories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription Plan</TableHead>
              <TableHead>Video Link</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedVideos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No videos found matching your search.' : 'No videos found. Upload your first video!'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedVideos.map((video) => {
                const thumbnailUrl = getThumbnailUrl(video)
                const hasPlaybackId = !!video.mux_playback_id
                return (
                  <TableRow key={video.video_id}>
                    <TableCell className="max-w-[150px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm truncate">{video.video_id}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={() => handleCopyVideoId(video.video_id)}
                          title="Copy Video ID"
                        >
                          {copiedVideoId === video.video_id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        {copiedVideoId === video.video_id && (
                          <span className="text-xs text-green-600 font-medium shrink-0">Copied!</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="truncate" title={video.description || 'No description'}>
                        {video.description || <span className="text-muted-foreground italic">No description</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate" title={video.meta_title || 'No meta title'}>
                        {video.meta_title || <span className="text-muted-foreground italic">No meta title</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate" title={video.meta_description || 'No meta description'}>
                        {video.meta_description || <span className="text-muted-foreground italic">No meta description</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      {video.equipments && video.equipments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {video.equipments.slice(0, 2).map((eq, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {eq}
                            </Badge>
                          ))}
                          {video.equipments.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{video.equipments.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate" title={video.instructions || 'No instructions'}>
                        {video.instructions || <span className="text-muted-foreground italic">No instructions</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[100px]">
                      {video.min_calories !== null && video.max_calories !== null ? (
                        <span className="text-sm">
                          {video.min_calories} - {video.max_calories}
                        </span>
                      ) : video.min_calories !== null ? (
                        <span className="text-sm">≥ {video.min_calories}</span>
                      ) : video.max_calories !== null ? (
                        <span className="text-sm">≤ {video.max_calories}</span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={video.status === 'Published' ? 'default' : 'secondary'}
                      >
                        {video.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {video.subscription_plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hasPlaybackId ? (
                        <div className="flex items-center gap-2">
                          {thumbnailUrl && (
                            <div className="relative group">
                              <img
                                src={thumbnailUrl}
                                alt={video.description || 'Video thumbnail'}
                                className="w-20 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setViewingVideo(video)}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingVideo(video)}
                            className="flex items-center gap-1"
                          >
                            <Play className="h-4 w-4" />
                            View Video
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Processing...</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(video.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVideo(video)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(video)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <EditVideoModal
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
        onVideoUpdated={handleVideoUpdated}
      />

      <VideoPlayerModal
        playbackId={viewingVideo?.mux_playback_id || null}
        videoTitle={viewingVideo?.description || undefined}
        open={!!viewingVideo}
        onClose={() => setViewingVideo(null)}
      />

      <AlertDialog open={!!deletingVideo} onOpenChange={(open) => !open && setDeletingVideo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
              {deletingVideo && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <span className="text-sm font-medium">{deletingVideo.description || 'No description'}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="border-2 border-destructive text-destructive bg-transparent hover:bg-destructive/10 hover:border-destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

