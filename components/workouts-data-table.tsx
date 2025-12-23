'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { Workout, getWorkouts } from '@/actions/workouts'

interface WorkoutDisplay {
  log_id: string
  user_id: string
  class_id: string
  completed_at: string
  duration_minutes: number
  difficulty_rating?: number | null
  mood_before?: string | null
  mood_after?: string | null
  calories_burned?: number | null
}

const ITEMS_PER_PAGE = 5

// Utility to normalize database workout to display format
const normalizeWorkout = (workout: Workout): WorkoutDisplay => ({
  log_id: workout.log_id,
  user_id: workout.user_id,
  class_id: workout.class_id,
  completed_at: workout.completed_at,
  duration_minutes: workout.duration_minutes,
  difficulty_rating: workout.difficulty_rating,
  mood_before: workout.mood_before,
  mood_after: workout.mood_after,
  calories_burned: workout.calories_burned,
})

export function WorkoutsDataTable({ initialWorkouts = [] }: { initialWorkouts: Workout[] }) {
  const [workouts, setWorkouts] = useState<WorkoutDisplay[]>(initialWorkouts.map(normalizeWorkout))
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(initialWorkouts.length === 0)

  useEffect(() => {
    if (initialWorkouts.length === 0) {
      const fetchData = async () => {
        setIsInitialLoading(true)
        setError(null)
        try {
          const result = await getWorkouts()
          if (result.success && result.data) {
            setWorkouts(result.data.map(normalizeWorkout))
          } else if (result.error) {
            setError('Failed to load workouts: ' + result.error)
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
  }, [initialWorkouts])

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(
      (workout) =>
        workout.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (workout.mood_before && workout.mood_before.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (workout.mood_after && workout.mood_after.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [workouts, searchTerm])

  const totalPages = Math.ceil(filteredWorkouts.length / ITEMS_PER_PAGE)
  const paginatedWorkouts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredWorkouts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredWorkouts, currentPage])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatUserId = (userId: string) => {
    return userId.substring(0, 8) + '...'
  }

  const formatClassId = (classId: string) => {
    return classId.substring(0, 8) + '...'
  }

  const getDifficultyRatingColor = (rating: number | null | undefined) => {
    if (!rating) return 'bg-gray-100 text-gray-600'
    if (rating <= 3) return 'bg-green-100 text-green-800'
    if (rating <= 6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getMoodEmoji = (mood: string | null | undefined) => {
    if (!mood) return '—'
    const normalized = mood.toLowerCase()
    if (normalized.includes('happy') || normalized.includes('great') || normalized.includes('excited')) return '😊'
    if (normalized.includes('good') || normalized.includes('okay') || normalized.includes('fine')) return '🙂'
    if (normalized.includes('tired') || normalized.includes('exhausted')) return '😴'
    if (normalized.includes('sad') || normalized.includes('down')) return '😔'
    if (normalized.includes('energetic') || normalized.includes('pumped')) return '💪'
    return '😐'
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
            placeholder="Search by user ID, class ID, or mood..."
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
          <span className="ml-3">Loading workout data...</span>
        </Card>
      )}

      {/* Data Table */}
      {!isInitialLoading && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>User ID</TableHead>
                  <TableHead>Class ID</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Difficulty Rating</TableHead>
                  <TableHead>Mood Before</TableHead>
                  <TableHead>Mood After</TableHead>
                  <TableHead>Calories Burned</TableHead>
                  <TableHead>Completed At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedWorkouts.length > 0 ? (
                  paginatedWorkouts.map((workout) => (
                    <TableRow key={workout.log_id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-xs">{formatUserId(workout.user_id)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatClassId(workout.class_id)}</TableCell>
                      <TableCell>{formatDuration(workout.duration_minutes)}</TableCell>
                      <TableCell>
                        {workout.difficulty_rating ? (
                          <span className={`inline-block px-2 py-1 rounded text-xs ${getDifficultyRatingColor(workout.difficulty_rating)}`}>
                            {workout.difficulty_rating}/10
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getMoodEmoji(workout.mood_before)}</span>
                          {workout.mood_before && (
                            <span className="text-sm text-gray-600">{workout.mood_before}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getMoodEmoji(workout.mood_after)}</span>
                          {workout.mood_after && (
                            <span className="text-sm text-gray-600">{workout.mood_after}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {workout.calories_burned ? (
                          <span className="text-sm font-medium">{workout.calories_burned} cal</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDateTime(workout.completed_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" disabled>
                            View
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
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching workouts found' : 'No workouts found'}
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

