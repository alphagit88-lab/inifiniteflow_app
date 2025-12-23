import { AdminLayout } from '@/components/admin-layout'
import { WorkoutsDataTable } from '@/components/workouts-data-table'
import { getWorkouts } from '@/actions/workouts'

export const metadata = {
  title: 'Workout Management | Admin',
  description: 'Manage workout logs and activity',
}

export default async function WorkoutPage() {
  const result = await getWorkouts()
  const initialWorkouts = Array.isArray(result.data) ? result.data : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Workout Management</h1>
          <p className="text-muted-foreground">Manage all workout logs and user activity</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-8">
          <WorkoutsDataTable initialWorkouts={initialWorkouts} />
        </div>
      </div>
    </AdminLayout>
  )
}

