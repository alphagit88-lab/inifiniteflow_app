'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getClassBanners, type ClassBanner } from '@/app/actions/banners'
import { AddBannerModal } from '@/components/add-banner-modal'
import { EditBannerModal } from '@/components/edit-banner-modal'
import { Plus, GripVertical, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'

export function ClassBannersTab() {
  const [banners, setBanners] = useState<ClassBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<ClassBanner | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const fetchBanners = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getClassBanners()
      if (result.success && result.data) {
        setBanners(result.data)
      } else {
        setError(result.error || 'Failed to load banners')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleBannerCreated = (banner: ClassBanner) => {
    setBanners([...banners, banner])
  }

  const handleBannerUpdated = (updatedBanner: ClassBanner) => {
    setBanners(banners.map((b) => (b.banner_id === updatedBanner.banner_id ? updatedBanner : b)))
    setEditingBanner(null)
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return
    }

    setDeletingId(bannerId)
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'DELETE',
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to delete banner')
      }

      setBanners(banners.filter((b) => b.banner_id !== bannerId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner')
    } finally {
      setDeletingId(null)
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

    const draggedItem = banners[draggedIndex]
    const newBanners = [...banners]

    // Remove dragged item from its original position
    newBanners.splice(draggedIndex, 1)

    // Insert dragged item at new position
    newBanners.splice(dropIndex, 0, draggedItem)

    // Update display_order for all items
    const updates = newBanners.map((banner, index) => ({
      banner_id: banner.banner_id,
      display_order: index,
    }))

    setIsReordering(true)
    try {
      const response = await fetch('/api/banners/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ banners: updates }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update banner order')
      }

      // Update local state with new order
      const updatedBanners = newBanners.map((banner, index) => ({
        ...banner,
        display_order: index,
      }))
      setBanners(updatedBanners)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update banner order')
      // Revert by refetching
      fetchBanners()
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Class Banners</h2>
          <p className="text-muted-foreground">Manage class banners and their display order</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
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
            <span className="ml-3 text-muted-foreground">Loading banners...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No banners found. Create your first banner to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, index) => (
                <TableRow
                  key={banner.banner_id}
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
                  <TableCell className="font-medium">{banner.display_order}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <img
                        src={banner.image_url}
                        alt={banner.title || 'Banner'}
                        className="h-16 w-24 object-cover rounded border"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{banner.title || '-'}</TableCell>
                  <TableCell>{banner.subtitle || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBanner(banner)}
                        disabled={isReordering}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(banner.banner_id)}
                        disabled={deletingId === banner.banner_id || isReordering}
                      >
                        {deletingId === banner.banner_id ? (
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

      <AddBannerModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onBannerCreated={handleBannerCreated} />
      <EditBannerModal banner={editingBanner} onClose={() => setEditingBanner(null)} onBannerUpdated={handleBannerUpdated} />
    </div>
  )
}

