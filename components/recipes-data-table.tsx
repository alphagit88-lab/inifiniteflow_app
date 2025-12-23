'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { Recipe, getRecipes } from '@/actions/recipes'
import { EditRecipeModal } from './edit-recipe-modal'
import { AddRecipeModal } from './add-recipe-modal'
import { Plus } from 'lucide-react'

interface RecipeDisplay {
  recipe_id: string
  recipe_name: string
  class_name: string
  difficulty: string
  prep_time_minutes: number
  cook_time_minutes: number
  total_time_minutes: number
  servings: number
  is_premium: boolean
  is_published: boolean
  calories_per_serving?: number | null
  created_at: string
}

const ITEMS_PER_PAGE = 5

// Utility to normalize database recipe to display format
const normalizeRecipe = (recipe: Recipe): RecipeDisplay => ({
  recipe_id: recipe.recipe_id,
  recipe_name: recipe.recipe_name,
  class_name: recipe.class_name,
  difficulty: recipe.difficulty,
  prep_time_minutes: recipe.prep_time_minutes,
  cook_time_minutes: recipe.cook_time_minutes,
  total_time_minutes: recipe.prep_time_minutes + recipe.cook_time_minutes,
  servings: recipe.servings,
  is_premium: recipe.is_premium,
  is_published: recipe.is_published,
  calories_per_serving: recipe.calories_per_serving,
  created_at: recipe.created_at,
})

export function RecipesDataTable({ initialRecipes = [] }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(initialRecipes.length === 0)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    if (initialRecipes.length === 0) {
      const fetchData = async () => {
        setIsInitialLoading(true)
        setError(null)
        try {
          const result = await getRecipes()
          if (result.success && result.data) {
            setRecipes(result.data)
          } else if (result.error) {
            setError('Failed to load recipes: ' + result.error)
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
  }, [initialRecipes])

  const filteredRecipes = useMemo(() => {
    return recipes.filter(
      (recipe) =>
        recipe.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [recipes, searchTerm])

  const totalPages = Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE)
  const paginatedRecipes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredRecipes.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredRecipes, currentPage])

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    setError(null)
    setDeletingId(recipeId)
    try {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || 'Failed to delete recipe')
      }

      setRecipes((prev) => prev.filter((recipe) => recipe.recipe_id !== recipeId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete recipe')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditClick = (recipe: Recipe) => {
    setEditingRecipe(recipe)
  }

  const handleRecipeUpdated = (updatedRecipe: Recipe) => {
    setRecipes((prev) => prev.map((recipe) => (recipe.recipe_id === updatedRecipe.recipe_id ? updatedRecipe : recipe)))
    setEditingRecipe(null)
  }

  const handleRecipeCreated = (newRecipe: Recipe) => {
    setRecipes((prev) => [newRecipe, ...prev])
    setIsAddModalOpen(false)
  }

  const closeEditModal = () => setEditingRecipe(null)

  const formatTime = (minutes: number) => {
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

  const getDifficultyColor = (difficulty: string) => {
    const normalized = difficulty.toLowerCase()
    if (normalized.includes('easy')) return 'bg-green-100 text-green-800'
    if (normalized.includes('medium') || normalized.includes('moderate')) return 'bg-yellow-100 text-yellow-800'
    if (normalized.includes('hard') || normalized.includes('difficult')) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
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
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search by recipe name, class name, or difficulty..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full"
            disabled={isInitialLoading}
          />
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} disabled={isInitialLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 border border-red-200 bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* Loading State */}
      {isInitialLoading && (
        <Card className="p-12 flex items-center justify-center text-lg text-gray-500">
          <Spinner />
          <span className="ml-3">Loading recipes data...</span>
        </Card>
      )}

      {/* Data Table */}
      {!isInitialLoading && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Recipe Name</TableHead>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Prep Time</TableHead>
                  <TableHead>Cook Time</TableHead>
                  <TableHead>Total Time</TableHead>
                  <TableHead>Servings</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecipes.length > 0 ? (
                  paginatedRecipes.map((recipe) => (
                    <TableRow key={recipe.recipe_id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium">{recipe.recipe_name}</TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                          {recipe.class_name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                          {recipe.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>{formatTime(recipe.prep_time_minutes)}</TableCell>
                      <TableCell>{formatTime(recipe.cook_time_minutes)}</TableCell>
                      <TableCell className="font-medium">{formatTime(recipe.prep_time_minutes + recipe.cook_time_minutes)}</TableCell>
                      <TableCell>{recipe.servings}</TableCell>
                      <TableCell>
                        {recipe.calories_per_serving ? (
                          <span className="text-sm">{recipe.calories_per_serving} cal</span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {recipe.is_premium ? (
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
                        {recipe.is_published ? (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            Draft
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{formatDate(recipe.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(recipe)}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRecipe(recipe.recipe_id)}
                            disabled={deletingId === recipe.recipe_id}
                          >
                            {deletingId === recipe.recipe_id ? (
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
                      {searchTerm ? 'No matching recipes found' : 'No recipes found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Modal */}
      <AddRecipeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRecipeCreated={handleRecipeCreated}
      />

      {/* Edit Modal */}
      <EditRecipeModal recipe={editingRecipe} onClose={closeEditModal} onRecipeUpdated={handleRecipeUpdated} />

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

