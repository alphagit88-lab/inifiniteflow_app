'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Allergy, getAllergies, updateAllergyOrder } from '@/app/actions/allergies'
import { EditAllergyDialog } from './edit-allergy-dialog'
import { AddAllergyDialog } from './add-allergy-dialog'
import { Edit, Plus, GripVertical } from 'lucide-react'

export function AllergiesTable() {
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null)
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
        const result = await getAllergies()
        if (result.success && result.data) {
          setAllergies(result.data)
        } else if (result.error) {
          setError('Failed to load allergies: ' + result.error)
        }
      } catch (e) {
        setError('An unexpected error occurred during fetch.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  // Sort allergies by order_number first, then filter
  const sortedAllergies = useMemo(() => {
    return [...allergies].sort((a, b) => {
      const aOrder = a.order_number ?? 999
      const bOrder = b.order_number ?? 999
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
      // Fallback to name if order_number is the same
      return a.name.localeCompare(b.name)
    })
  }, [allergies])

  const filteredAllergies = useMemo(() => {
    return sortedAllergies.filter(
      (allergy) =>
        allergy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (allergy.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    )
  }, [sortedAllergies, searchTerm])

  const handleAllergyUpdated = (updatedAllergy: Allergy) => {
    setAllergies((prev) =>
      prev.map((a) => (a.allergy_id === updatedAllergy.allergy_id ? updatedAllergy : a))
    )
    setEditingAllergy(null)
  }

  const handleAllergyAdded = () => {
    setRefreshKey((prev) => prev + 1)
    setIsAddDialogOpen(false)
  }

  const toggleActiveStatus = async (allergy: Allergy) => {
    try {
      const { updateAllergy } = await import('@/app/actions/allergies')
      const result = await updateAllergy({
        allergy_id: allergy.allergy_id,
        is_active: !allergy.is_active,
      })
      if (result.success && result.data) {
        setAllergies((prev) =>
          prev.map((a) => (a.allergy_id === allergy.allergy_id ? result.data! : a))
        )
      } else {
        alert('Failed to update allergy: ' + result.error)
      }
    } catch (err) {
      alert('An unexpected error occurred while updating the allergy.')
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

    // Work with the full allergies list (sorted by order_number)
    const sortedAllergies = [...allergies].sort((a, b) => {
      const aOrder = a.order_number ?? 999
      const bOrder = b.order_number ?? 999
      return aOrder - bOrder
    })

    const draggedItem = sortedAllergies[draggedIndex]
    const newAllergies = [...sortedAllergies]
    
    // Remove dragged item from its original position
    newAllergies.splice(draggedIndex, 1)
    
    // Insert dragged item at new position
    newAllergies.splice(dropIndex, 0, draggedItem)

    // Update order numbers for all items
    const updates = newAllergies.map((allergy, index) => ({
      allergy_id: allergy.allergy_id,
      order_number: index,
    }))

    setIsReordering(true)
    try {
      const result = await updateAllergyOrder(updates)
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
        <p className="text-muted-foreground">Loading allergies...</p>
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
            placeholder="Search allergies by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Allergy
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
            {filteredAllergies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No allergies found matching your search.' : 'No allergies found. Add your first allergy!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAllergies.map((allergy, filteredIndex) => {
                // Find the index in the sorted (full) list for drag operations
                const sortedIndex = sortedAllergies.findIndex(a => a.allergy_id === allergy.allergy_id)
                const canDrag = !isReordering && !searchTerm
                
                return (
                <TableRow
                  key={allergy.allergy_id}
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
                  <TableCell className="font-medium">{allergy.name}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={allergy.description || 'No description'}>
                      {allergy.description || <span className="text-muted-foreground italic">No description</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={allergy.is_active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleActiveStatus(allergy)}
                      className={allergy.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
                      disabled={isReordering}
                    >
                      {allergy.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(allergy.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAllergy(allergy)}
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

      <AddAllergyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAllergyAdded={handleAllergyAdded}
      />

      <EditAllergyDialog
        allergy={editingAllergy}
        onClose={() => setEditingAllergy(null)}
        onAllergyUpdated={handleAllergyUpdated}
      />
    </div>
  )
}

