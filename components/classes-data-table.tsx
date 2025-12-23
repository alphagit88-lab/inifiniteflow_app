'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { Class, getClasses } from '@/actions/classes'
import { EditClassModal } from './edit-class-modal'
import { AddClassModal } from './add-class-modal'
import { ViewClassVideosDialog } from './view-class-videos-dialog'
import { Plus, Video } from 'lucide-react'

interface ClassDisplay {
  class_id: string
  class_name: string
  category: string
  level: string
  duration: number
  intensity_level: string
  is_premium: boolean
  is_published: boolean
  view_count: number
  completion_count: number
  created_at: string
}

const ITEMS_PER_PAGE = 5

// Utility to normalize database class to display format
const normalizeClass = (cls: Class): ClassDisplay => ({
  class_id: cls.class_id,
  class_name: cls.class_name,
  category: cls.category,
  level: cls.level,
  duration: cls.duration,
  intensity_level: cls.intensity_level,
  is_premium: cls.is_premium,
  is_published: cls.is_published,
  view_count: cls.view_count,
  completion_count: cls.completion_count,
  created_at: cls.created_at,
})

export function ClassesDataTable({ initialClasses = [] }: { initialClasses: Class[] }) {
  const [classes, setClasses] = useState<Class[]>(initialClasses)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(initialClasses.length === 0)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [viewingVideosClassId, setViewingVideosClassId] = useState<string | null>(null)
  const [viewingVideosClassName, setViewingVideosClassName] = useState<string>('')

  // Fallback Effect: Attempt to fetch data if the initial prop was empty.
  useEffect(() => {
    if (initialClasses.length === 0) {
      const fetchData = async () => {
        setIsInitialLoading(true)
        setError(null)
        try {
          const result = await getClasses()
          if (result.success && result.data) {
            setClasses(result.data)
          } else if (result.error) {
            setError('Failed to load classes: ' + result.error)
          }
        } catch (e) {
          setError('An unexpected error occurred during client-side fetch.')
        } finally {
          setIsInitialLoading(false)
        }
      }
      fetchData()
    } else {
      setIsInitialLoading(false)
    }
  }, [initialClasses])

  const filteredClasses = useMemo(() => {
    return classes.filter(
      (cls) =>
        cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.intensity_level.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [classes, searchTerm])

  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE)
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredClasses.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredClasses, currentPage])

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return

    setError(null)
    setDeletingId(classId)
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete class')
      }

      setClasses((prev) => prev.filter((cls) => cls.class_id !== classId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete class')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditClick = (cls: Class) => {
    setEditingClass(cls)
  }

  const handleClassUpdated = (updatedClass: Class) => {
    setClasses((prev) => prev.map((cls) => (cls.class_id === updatedClass.class_id ? updatedClass : cls)))
    setEditingClass(null)
  }

  const handleClassCreated = (newClass: Class) => {
    setClasses((prev) => [newClass, ...prev])
    setIsAddModalOpen(false)
  }

  const closeEditModal = () => setEditingClass(null)

  const handleViewVideos = (cls: Class) => {
    setViewingVideosClassId(cls.class_id)
    setViewingVideosClassName(cls.class_name)
  }

  const closeViewVideos = () => {
    setViewingVideosClassId(null)
    setViewingVideosClassName('')
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Custom spinner/loader
  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )

  return (
    <div className="w-full space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search by class name, category, level, or intensity..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full"
            disabled={isInitialLoading}
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Class
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Loading State */}
      {isInitialLoading && (
        <Card className="p-12 flex items-center justify-center text-lg text-gray-500">
          <Spinner />
          <span className="ml-3">Loading classes data...</span>
        </Card>
      )}

      {/* Data Table */}
      {!isInitialLoading && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Class Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Intensity</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Completions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Videos</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClasses.length > 0 ? (
                  paginatedClasses.map((cls) => (
                    <TableRow key={cls.class_id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{cls.class_name}</TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {cls.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                          {cls.level}
                        </span>
                      </TableCell>
                      <TableCell>{formatDuration(cls.duration)}</TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                          {cls.intensity_level}
                        </span>
                      </TableCell>
                      <TableCell>
                        {cls.is_premium ? (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 font-semibold">
                            Premium
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            Free
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {cls.is_published ? (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            Draft
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{cls.view_count.toLocaleString()}</TableCell>
                      <TableCell>{cls.completion_count.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(cls.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewVideos(cls)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          View Videos
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(cls)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClass(cls.class_id)}
                            disabled={deletingId === cls.class_id}
                          >
                            {deletingId === cls.class_id ? (
                              <>
                                <Spinner />
                                Deleting...
                              </>
                            ) : (
                              'Delete'
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching classes found' : 'No classes found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Modal */}
      <AddClassModal 
        open={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onClassCreated={handleClassCreated} 
      />

      {/* Edit Modal */}
      <EditClassModal classData={editingClass} onClose={closeEditModal} onClassUpdated={handleClassUpdated} />

      {/* View Videos Dialog */}
      <ViewClassVideosDialog
        classId={viewingVideosClassId}
        className={viewingVideosClassName}
        open={viewingVideosClassId !== null}
        onClose={closeViewVideos}
      />

      {/* Pagination */}
      {totalPages > 1 && !isInitialLoading && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

