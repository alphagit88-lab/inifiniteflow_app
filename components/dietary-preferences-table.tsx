'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { DietaryPreference, getDietaryPreferences, updateDietaryPreferenceOrder } from '@/app/actions/dietary-preferences'
import { EditDietaryPreferenceDialog } from './edit-dietary-preference-dialog'
import { AddDietaryPreferenceDialog } from './add-dietary-preference-dialog'
import { Edit, Plus, GripVertical } from 'lucide-react'

export function DietaryPreferencesTable() {
  const [preferences, setPreferences] = useState<DietaryPreference[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingPreference, setEditingPreference] = useState<DietaryPreference | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  // Fetch data when component mounts or when refreshKey changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getDietaryPreferences()
        if (result.success && result.data) {
          setPreferences(result.data)
        } else if (result.error) {
          setError('Failed to load dietary preferences: ' + result.error)
        }
      } catch (e) {
        setError('An unexpected error occurred during fetch.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  // Sort preferences by order_number first, then filter
  const sortedPreferences = useMemo(() => {
    return [...preferences].sort((a, b) => {
      const aOrder = a.order_number ?? 999
      const bOrder = b.order_number ?? 999
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
      // Fallback to name if order_number is the same
      return a.name.localeCompare(b.name)
    })
  }, [preferences])

  const filteredPreferences = useMemo(() => {
    return sortedPreferences.filter(
      (preference) =>
        preference.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (preference.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    )
  }, [sortedPreferences, searchTerm])

  const handlePreferenceUpdated = (updatedPreference: DietaryPreference) => {
    setPreferences((prev) =>
      prev.map((p) => (p.preference_id === updatedPreference.preference_id ? updatedPreference : p))
    )
    setEditingPreference(null)
  }

  const handlePreferenceAdded = () => {
    setRefreshKey((prev) => prev + 1)
    setIsAddDialogOpen(false)
  }

  const toggleActiveStatus = async (preference: DietaryPreference) => {
    try {
      const { updateDietaryPreference } = await import('@/app/actions/dietary-preferences')
      const result = await updateDietaryPreference({
        preference_id: preference.preference_id,
        is_active: !preference.is_active,
      })
      if (result.success && result.data) {
        setPreferences((prev) =>
          prev.map((p) => (p.preference_id === preference.preference_id ? result.data! : p))
        )
      } else {
        alert('Failed to update dietary preference: ' + result.error)
      }
    } catch (err) {
      alert('An unexpected error occurred while updating the dietary preference.')
      console.error('Update error:', err)
    }
  }

  const handleDragStart = (index: number) => {
    // Only allow dragging when there's no search filter
    if (searchTerm) return
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index || searchTerm) return
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    // Only allow dropping when there's no search filter
    if (searchTerm || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Work with the full preferences list (sorted by order_number)
    const sortedPrefs = [...preferences].sort((a, b) => {
      const aOrder = a.order_number ?? 999
      const bOrder = b.order_number ?? 999
      return aOrder - bOrder
    })

    const draggedItem = sortedPrefs[draggedIndex]
    const newPreferences = [...sortedPrefs]
    
    // Remove dragged item from its original position
    newPreferences.splice(draggedIndex, 1)
    
    // Insert dragged item at new position
    newPreferences.splice(dropIndex, 0, draggedItem)

    // Update order numbers for all items
    const updates = newPreferences.map((preference, index) => ({
      preference_id: preference.preference_id,
      order_number: index,
    }))

    setIsReordering(true)
    try {
      const result = await updateDietaryPreferenceOrder(updates)
      if (result.success) {
        // Refresh to get updated data with new order
        setRefreshKey((prev) => prev + 1)
      } else {
        alert('Failed to update order: ' + result.error)
        // Refresh to revert to original order
        setRefreshKey((prev) => prev + 1)
      }
    } catch (err) {
      alert('An unexpected error occurred while updating the order.')
      console.error('Reorder error:', err)
      // Refresh to revert to original order
      setRefreshKey((prev) => prev + 1)
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

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Loading dietary preferences...</p>
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
            placeholder="Search dietary preferences by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Dietary Preference
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPreferences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No dietary preferences found matching your search.' : 'No dietary preferences found. Add your first dietary preference!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPreferences.map((preference, filteredIndex) => {
                // Find the index in the sorted (full) list for drag operations
                const sortedIndex = sortedPreferences.findIndex(p => p.preference_id === preference.preference_id)
                const canDrag = !isReordering && !searchTerm
                
                return (
                <TableRow
                  key={preference.preference_id}
                  draggable={canDrag}
                  onDragStart={() => handleDragStart(sortedIndex)}
                  onDragOver={(e) => handleDragOver(e, sortedIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, sortedIndex)}
                  onDragEnd={handleDragEnd}
                  className={`${canDrag ? 'cursor-move' : ''} ${draggedIndex === sortedIndex ? 'opacity-50' : ''} ${dragOverIndex === sortedIndex ? 'bg-muted border-2 border-primary' : ''}`}
                >
                  <TableCell className="w-10">
                    <GripVertical className={`h-5 w-5 ${canDrag ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
                  </TableCell>
                  <TableCell className="font-medium">{preference.name}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={preference.description || 'No description'}>
                      {preference.description || <span className="text-muted-foreground italic">No description</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={preference.is_active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleActiveStatus(preference)}
                      className={preference.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
                      disabled={isReordering}
                    >
                      {preference.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(preference.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPreference(preference)}
                      disabled={isReordering}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <AddDietaryPreferenceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPreferenceAdded={handlePreferenceAdded}
      />

      <EditDietaryPreferenceDialog
        preference={editingPreference}
        onClose={() => setEditingPreference(null)}
        onPreferenceUpdated={handlePreferenceUpdated}
      />
    </div>
  )
}

