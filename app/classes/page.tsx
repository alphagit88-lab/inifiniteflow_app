import { AdminLayout } from '@/components/admin-layout'
import { ClassesDataTable } from '@/components/classes-data-table'
import { getClasses } from '@/actions/classes'

export const metadata = {
  title: 'Class Management | Admin',
  description: 'Manage classes and course content',
}

export default async function ClassesPage() {
  const result = await getClasses()
  const initialClasses = Array.isArray(result.data) ? result.data : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Class Management</h1>
          <p className="text-muted-foreground">Manage all classes and course content</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-8">
          <ClassesDataTable initialClasses={initialClasses} />
        </div>
      </div>
    </AdminLayout>
  )
}

