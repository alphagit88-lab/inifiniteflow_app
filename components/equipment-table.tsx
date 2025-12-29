'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Equipment, getEquipment } from '@/app/actions/equipment'
import { EditEquipmentDialog } from './edit-equipment-dialog'
import { AddEquipmentDialog } from './add-equipment-dialog'
import { Edit, Plus } from 'lucide-react'

export function EquipmentTable() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch data when component mounts or when refreshKey changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getEquipment()
        if (result.success && result.data) {
          setEquipment(result.data)
        } else if (result.error) {
          setError('Failed to load equipment: ' + result.error)
        }
      } catch (e) {
        setError('An unexpected error occurred during fetch.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  const filteredEquipment = useMemo(() => {
    return equipment.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    )
  }, [equipment, searchTerm])

  const handleEquipmentUpdated = (updatedEquipment: Equipment) => {
    setEquipment((prev) =>
      prev.map((e) => (e.equipment_id === updatedEquipment.equipment_id ? updatedEquipment : e))
    )
    setEditingEquipment(null)
  }

  const handleEquipmentAdded = () => {
    setRefreshKey((prev) => prev + 1)
    setIsAddDialogOpen(false)
  }

  const toggleActiveStatus = async (item: Equipment) => {
    try {
      const { updateEquipment } = await import('@/app/actions/equipment')
      const result = await updateEquipment({
        equipment_id: item.equipment_id,
        is_active: !item.is_active,
      })
      if (result.success && result.data) {
        setEquipment((prev) =>
          prev.map((e) => (e.equipment_id === item.equipment_id ? result.data! : e))
        )
      } else {
        alert('Failed to update equipment: ' + result.error)
      }
    } catch (err) {
      alert('An unexpected error occurred while updating the equipment.')
      console.error('Update error:', err)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Loading equipment...</p>
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
            placeholder="Search equipment by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No equipment found matching your search.' : 'No equipment found. Add your first equipment!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredEquipment.map((item) => (
                <TableRow key={item.equipment_id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={item.description || 'No description'}>
                      {item.description || <span className="text-muted-foreground italic">No description</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={item.is_active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleActiveStatus(item)}
                      className={item.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingEquipment(item)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AddEquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onEquipmentAdded={handleEquipmentAdded}
      />

      <EditEquipmentDialog
        equipment={editingEquipment}
        onClose={() => setEditingEquipment(null)}
        onEquipmentUpdated={handleEquipmentUpdated}
      />
    </div>
  )
}

