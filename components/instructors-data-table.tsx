'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { Instructor, getInstructors } from '@/actions/instructors'

interface InstructorDisplay {
  instructor_id: string
  bio: string
  is_featured: boolean
  total_students: number
  total_classes: number
  joined_at: string
  specialization?: string[] | null
  certifications?: string[] | null
  years_experience?: number | null
  rating?: number | null
}

const ITEMS_PER_PAGE = 5

// Utility to normalize database instructor to display format
const normalizeInstructor = (instructor: Instructor): InstructorDisplay => ({
  instructor_id: instructor.instructor_id,
  bio: instructor.bio,
  is_featured: instructor.is_featured,
  total_students: instructor.total_students,
  total_classes: instructor.total_classes,
  joined_at: instructor.joined_at,
  specialization: instructor.specialization,
  certifications: instructor.certifications,
  years_experience: instructor.years_experience,
  rating: instructor.rating,
})

export function InstructorsDataTable({ initialInstructors = [] }: { initialInstructors: Instructor[] }) {
  const [instructors, setInstructors] = useState<InstructorDisplay[]>(initialInstructors.map(normalizeInstructor))
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(initialInstructors.length === 0)

  useEffect(() => {
    if (initialInstructors.length === 0) {
      const fetchData = async () => {
        setIsInitialLoading(true)
        setError(null)
        try {
          const result = await getInstructors()
          if (result.success && result.data) {
            setInstructors(result.data.map(normalizeInstructor))
          } else if (result.error) {
            setError('Failed to load instructors: ' + result.error)
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
  }, [initialInstructors])

  const filteredInstructors = useMemo(() => {
    return instructors.filter(
      (instructor) =>
        instructor.instructor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (instructor.specialization &&
          instructor.specialization.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (instructor.certifications &&
          instructor.certifications.some((cert) => cert.toLowerCase().includes(searchTerm.toLowerCase())))
    )
  }, [instructors, searchTerm])

  const totalPages = Math.ceil(filteredInstructors.length / ITEMS_PER_PAGE)
  const paginatedInstructors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredInstructors.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredInstructors, currentPage])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatInstructorId = (id: string) => {
    return id.substring(0, 8) + '...'
  }

  const formatBio = (bio: string) => {
    if (bio.length <= 60) return bio
    return bio.substring(0, 60) + '...'
  }

  const getRatingColor = (rating: number | null | undefined) => {
    if (!rating) return 'bg-gray-100 text-gray-600'
    if (rating >= 4.5) return 'bg-green-100 text-green-800'
    if (rating >= 4.0) return 'bg-yellow-100 text-yellow-800'
    if (rating >= 3.5) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
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
            placeholder="Search by instructor ID, bio, specialization, or certifications..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full"
            disabled={isInitialLoading}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Loading State */}
      {isInitialLoading && (
        <Card className="p-12 flex items-center justify-center text-lg text-gray-500">
          <Spinner />
          <span className="ml-3">Loading instructors data...</span>
        </Card>
      )}

      {/* Data Table */}
      {!isInitialLoading && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Instructor ID</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Years Exp.</TableHead>
                  <TableHead>Total Students</TableHead>
                  <TableHead>Total Classes</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInstructors.length > 0 ? (
                  paginatedInstructors.map((instructor) => (
                    <TableRow key={instructor.instructor_id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-xs">{formatInstructorId(instructor.instructor_id)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm text-gray-700" title={instructor.bio}>
                          {formatBio(instructor.bio)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {instructor.specialization && instructor.specialization.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {instructor.specialization.slice(0, 2).map((spec, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                {spec}
                              </span>
                            ))}
                            {instructor.specialization.length > 2 && (
                              <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                                +{instructor.specialization.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {instructor.years_experience ? (
                          <span className="text-sm font-medium">{instructor.years_experience} yrs</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{instructor.total_students.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{instructor.total_classes.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        {instructor.rating ? (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRatingColor(instructor.rating)}`}>
                            ⭐ {instructor.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {instructor.is_featured ? (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 font-semibold">
                            ⭐ Featured
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            Regular
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(instructor.joined_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" disabled>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" disabled>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching instructors found' : 'No instructors found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

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

