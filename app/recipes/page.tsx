import { AdminLayout } from '@/components/admin-layout'
import { RecipesDataTable } from '@/components/recipes-data-table'
import { getRecipes } from '@/actions/recipes'

export const metadata = {
  title: 'Recipe Management | Admin',
  description: 'Manage recipes and meal plans',
}

export default async function RecipesPage() {
  const result = await getRecipes()
  const initialRecipes = Array.isArray(result.data) ? result.data : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Recipe Management</h1>
          <p className="text-muted-foreground">Manage all recipes and meal plans</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-8">
          <RecipesDataTable initialRecipes={initialRecipes} />
        </div>
      </div>
    </AdminLayout>
  )
}

