'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import type { Recipe } from '@/actions/recipes'
import { uploadBanner } from '@/app/actions/banners'
import { useRef } from 'react'

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard', 'Expert'] as const
const MEAL_TYPE_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'] as const

type EditableRecipe = Pick<
  Recipe,
  | 'recipe_id'
  | 'recipe_name'
  | 'description'
  | 'prep_time_minutes'
  | 'cook_time_minutes'
  | 'servings'
  | 'difficulty'
  | 'class_name'
  | 'is_premium'
  | 'is_published'
  | 'calories_per_serving'
  | 'protein_grams'
  | 'carbs_grams'
  | 'fat_grams'
  | 'fiber_grams'
  | 'meal_type'
>

interface EditRecipeModalProps {
  recipe: EditableRecipe | null
  onClose: () => void
  onRecipeUpdated: (recipe: Recipe) => void
}

export function EditRecipeModal({ recipe, onClose, onRecipeUpdated }: EditRecipeModalProps) {
  const [formData, setFormData] = useState<{
    recipe_name: string
    description: string
    instructions: string
    prep_time_minutes: number
    cook_time_minutes: number
    servings: number
    difficulty: (typeof DIFFICULTY_OPTIONS)[number]
    class_name: string
    is_premium: boolean
    is_published: boolean
    calories_per_serving: string
    protein_grams: string
    carbs_grams: string
    fat_grams: string
    fiber_grams: string
    meal_type: (typeof MEAL_TYPE_OPTIONS)[number] | ''
  }>({
    recipe_name: '',
    description: '',
    instructions: '',
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 4,
    difficulty: DIFFICULTY_OPTIONS[0],
    class_name: '',
    is_premium: false,
    is_published: false,
    calories_per_serving: '',
    protein_grams: '',
    carbs_grams: '',
    fat_grams: '',
    fiber_grams: '',
    meal_type: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (recipe) {
      setFormData({
        recipe_name: recipe.recipe_name || '',
        description: recipe.description || '',
        instructions: (recipe as any).instructions || '',
        prep_time_minutes: recipe.prep_time_minutes || 10,
        cook_time_minutes: recipe.cook_time_minutes || 20,
        servings: recipe.servings || 4,
        difficulty: (DIFFICULTY_OPTIONS.includes(recipe.difficulty as any)
          ? (recipe.difficulty as (typeof DIFFICULTY_OPTIONS)[number])
          : DIFFICULTY_OPTIONS[0]),
        class_name: recipe.class_name || '',
        is_premium: recipe.is_premium || false,
        is_published: recipe.is_published || false,
        calories_per_serving: recipe.calories_per_serving?.toString() || '',
        protein_grams: recipe.protein_grams?.toString() || '',
        carbs_grams: recipe.carbs_grams?.toString() || '',
        fat_grams: recipe.fat_grams?.toString() || '',
        fiber_grams: recipe.fiber_grams?.toString() || '',
        meal_type: (recipe as any).meal_type || '',
      })
      setSelectedBanner(null)
      const existingBanner = (recipe as any).banner_image
      setBannerPreview(existingBanner || null)
      setError(null)
    }
  }, [recipe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipe?.recipe_id) {
      setError('Recipe ID is missing')
      return
    }

    if (!formData.recipe_name.trim() || !formData.description.trim() || !formData.class_name.trim()) {
      setError('Recipe name, description, and class name are required')
      return
    }

    if (formData.prep_time_minutes <= 0 || formData.cook_time_minutes <= 0 || formData.servings <= 0) {
      setError('Prep time, cook time, and servings must be greater than 0')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Upload banner image if selected
      let bannerUrl = (recipe as any).banner_image || null
      if (selectedBanner) {
        const bannerResult = await uploadBanner(selectedBanner, recipe.recipe_id)
        if (bannerResult.success && bannerResult.url) {
          bannerUrl = bannerResult.url
        } else {
          console.warn('Failed to upload banner:', bannerResult.error)
          setError(bannerResult.error || 'Failed to upload banner')
          setIsSubmitting(false)
          return
        }
      }

      const response = await fetch(`/api/recipes/${recipe.recipe_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipe_name: formData.recipe_name.trim(),
          description: formData.description.trim(),
          instructions: formData.instructions || null,
          prep_time_minutes: formData.prep_time_minutes,
          cook_time_minutes: formData.cook_time_minutes,
          servings: formData.servings,
          difficulty: formData.difficulty,
          class_name: formData.class_name.trim(),
          is_premium: formData.is_premium,
          is_published: formData.is_published,
          calories_per_serving: formData.calories_per_serving ? parseInt(formData.calories_per_serving) : null,
          protein_grams: formData.protein_grams ? parseFloat(formData.protein_grams) : null,
          carbs_grams: formData.carbs_grams ? parseFloat(formData.carbs_grams) : null,
          fat_grams: formData.fat_grams ? parseFloat(formData.fat_grams) : null,
          fiber_grams: formData.fiber_grams ? parseFloat(formData.fiber_grams) : null,
          meal_type: formData.meal_type || null,
          banner_image: bannerUrl,
        }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to update recipe')
      }

      onRecipeUpdated(payload.data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update recipe')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={Boolean(recipe)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
          <DialogDescription>Update the recipe details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-recipe-name">Recipe Name *</Label>
            <Input
              id="edit-recipe-name"
              placeholder="Healthy Quinoa Bowl"
              value={formData.recipe_name}
              onChange={(e) => setFormData({ ...formData, recipe_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              placeholder="A nutritious and delicious quinoa bowl..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-instructions">Instructions</Label>
            <RichTextEditor
              value={formData.instructions}
              onChange={(value) => setFormData({ ...formData, instructions: value })}
              placeholder="Enter step-by-step instructions for preparing this recipe..."
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-prep-time">Prep Time (minutes) *</Label>
              <Input
                id="edit-prep-time"
                type="number"
                min="1"
                placeholder="10"
                value={formData.prep_time_minutes}
                onChange={(e) => setFormData({ ...formData, prep_time_minutes: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cook-time">Cook Time (minutes) *</Label>
              <Input
                id="edit-cook-time"
                type="number"
                min="1"
                placeholder="20"
                value={formData.cook_time_minutes}
                onChange={(e) => setFormData({ ...formData, cook_time_minutes: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-servings">Servings *</Label>
              <Input
                id="edit-servings"
                type="number"
                min="1"
                placeholder="4"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-difficulty">Difficulty *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value as (typeof DIFFICULTY_OPTIONS)[number] })
                }
              >
                <SelectTrigger id="edit-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-class-name">Class Name *</Label>
              <Input
                id="edit-class-name"
                placeholder="Breakfast Recipes"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-meal-type">Meal Type</Label>
              <Select
                value={formData.meal_type || undefined}
                onValueChange={(value) => setFormData({ ...formData, meal_type: value as (typeof MEAL_TYPE_OPTIONS)[number] })}
              >
                <SelectTrigger id="edit-meal-type">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-banner">Banner Image (JPEG, PNG, or WebP)</Label>
            <div className="space-y-2">
              <Input
                id="edit-banner"
                type="file"
                accept=".jpeg,.jpg,.png,.webp,image/jpeg,image/png,image/webp"
                ref={bannerInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedBanner(file)
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setBannerPreview(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                disabled={isSubmitting}
                className="cursor-pointer"
              />
              {bannerPreview && (
                <div className="mt-2">
                  <img
                    src={bannerPreview}
                    alt="Banner preview"
                    className="max-w-full max-h-[200px] object-contain border rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-premium">Premium Recipe</Label>
              <Select
                value={formData.is_premium ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, is_premium: value === 'true' })}
              >
                <SelectTrigger id="edit-premium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Free</SelectItem>
                  <SelectItem value="true">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-published">Published Status</Label>
              <Select
                value={formData.is_published ? 'true' : 'false'}
                onValueChange={(value) => setFormData({ ...formData, is_published: value === 'true' })}
              >
                <SelectTrigger id="edit-published">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Draft</SelectItem>
                  <SelectItem value="true">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Nutritional Information (Optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-calories">Calories per Serving</Label>
                <Input
                  id="edit-calories"
                  type="number"
                  min="0"
                  placeholder="250"
                  value={formData.calories_per_serving}
                  onChange={(e) => setFormData({ ...formData, calories_per_serving: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-protein">Protein (grams)</Label>
                <Input
                  id="edit-protein"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="15.5"
                  value={formData.protein_grams}
                  onChange={(e) => setFormData({ ...formData, protein_grams: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-carbs">Carbs (grams)</Label>
                <Input
                  id="edit-carbs"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="30.0"
                  value={formData.carbs_grams}
                  onChange={(e) => setFormData({ ...formData, carbs_grams: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-fat">Fat (grams)</Label>
                <Input
                  id="edit-fat"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="8.5"
                  value={formData.fat_grams}
                  onChange={(e) => setFormData({ ...formData, fat_grams: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-fiber">Fiber (grams)</Label>
                <Input
                  id="edit-fiber"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="5.0"
                  value={formData.fiber_grams}
                  onChange={(e) => setFormData({ ...formData, fiber_grams: e.target.value })}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

