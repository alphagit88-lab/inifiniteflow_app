import { AdminLayout } from '@/components/admin-layout'
import { InstructorsDataTable } from '@/components/instructors-data-table'
import { getInstructors } from '@/actions/instructors'

export const metadata = {
  title: 'Instructor Management | Admin',
  description: 'Manage instructors and their profiles',
}

export default async function InstructorsPage() {
  const result = await getInstructors()
  const initialInstructors = Array.isArray(result.data) ? result.data : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Instructor Management</h1>
          <p className="text-muted-foreground">Manage all instructors and their profiles</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-8">
          <InstructorsDataTable initialInstructors={initialInstructors} />
        </div>
      </div>
    </AdminLayout>
  )
}

