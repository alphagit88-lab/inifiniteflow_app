'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { AddUserModal } from './add-user-modal'
import { EditUserModal } from './edit-user-modal'
import { Profile, getUserProfiles } from '@/actions/profiles'

interface User {
  user_id: string
  nickname: string
  email: string
  userType: string
  subscriptionStatus: string
  createdAt?: string
}

const ITEMS_PER_PAGE = 5

// Utility to normalize snake_case from database to camelCase for the client component state
const normalizeUser = (user: Profile): User => ({
  user_id: user.user_id || crypto.randomUUID(),
  nickname: user.nickname,
  email: user.email,
  // Mapping database snake_case keys to component camelCase keys
  userType: user.user_type,
  subscriptionStatus: user.subscription_status,
  createdAt: user.created_at,
})

const denormalizeUser = (user: User): Profile => ({
  user_id: user.user_id,
  nickname: user.nickname,
  email: user.email,
  user_type: user.userType,
  subscription_status: user.subscriptionStatus,
  created_at: user.createdAt || new Date().toISOString(),
})

export function UserDataTable({ initialUsers = [] }: { initialUsers: Profile[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers.map(normalizeUser))
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(initialUsers.length === 0)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)

  // Fallback Effect: Attempt to fetch data if the initial prop was empty.
  useEffect(() => {
    // If we received an empty array initially, try fetching the data again.
    if (initialUsers.length === 0) {
      const fetchData = async () => {
        setIsInitialLoading(true)
        setError(null)
        try {
          // Calling the server action from the client component
          const result = await getUserProfiles()
          if (result.success && result.data) {
            setUsers(result.data.map(normalizeUser))
          } else if (result.error) {
            setError('Failed to load user profiles: ' + result.error)
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
  }, [initialUsers]) // Only run once on mount if initialUsers is empty

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userType.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredUsers, currentPage])

  const handleDeleteUser = async (id: string) => {
    // Confirmation (use a custom modal in production, but console log for now)
    if (!confirm('Are you sure you want to delete this user?')) return

    setError(null)
    setDeletingId(id)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete user')
      }

      setUsers((prev) => prev.filter((user) => user.user_id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUserCreated = (newUser: Profile) => {
    setUsers((prev) => {
      const mapped = normalizeUser(newUser)
      // Add new user to the top of the list
      return [mapped, ...prev]
    })
    setIsModalOpen(false)
  }

  const handleEditClick = (user: User) => {
    setEditingUser(denormalizeUser(user))
  }

  const handleUserUpdated = (updatedUser: Profile) => {
    setUsers((prev) => prev.map((user) => (user.user_id === updatedUser.user_id ? normalizeUser(updatedUser) : user)))
    setEditingUser(null)
  }

  const closeEditModal = () => setEditingUser(null)

const getStatusColor = (status: string) => {
  const normalizedStatus = (status || '').toUpperCase()
    switch (normalizedStatus) {
      // Assuming 'Active', 'Inactive', 'Pending' are the status values
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Custom spinner/loader for a better look
  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="w-full space-y-6">
      {/* Header with Add User Button and Search */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search by nickname, email, or user type..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full"
            disabled={isInitialLoading}
          />
        </div>
        <AddUserModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} onUserCreated={handleUserCreated} />
        <EditUserModal user={editingUser} onClose={closeEditModal} onUserUpdated={handleUserUpdated} />
      </div>

      {error && <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Loading State */}
      {isInitialLoading && (
        <Card className="p-12 flex items-center justify-center text-lg text-gray-500">
          <Spinner />
          <span className="ml-3">Loading user data...</span>
        </Card>
      )}

      {/* Data Table */}
      {!isInitialLoading && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Nickname</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Subscription Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.user_id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{user.nickname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.userType}</TableCell>
                      <TableCell>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.subscriptionStatus)}`}>
                          {user.subscriptionStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.user_id)}
                            disabled={deletingId === user.user_id}
                          >
                            {deletingId === user.user_id ? (
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
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching users found' : 'No users found'}
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