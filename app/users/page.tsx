import { AdminLayout } from '@/components/admin-layout'
import { UserDataTable } from '@/components/user-data-table'
import { getUserProfiles } from '@/actions/profiles'

export const metadata = {
  title: 'User Management | Admin',
  description: 'Manage users and permissions',
}

export default async function UsersPage() {
  const result = await getUserProfiles()
  const initialUsers = Array.isArray(result.data) ? result.data : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage all non-admin users and their permissions</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-8">
          <UserDataTable initialUsers={initialUsers} />
        </div>
      </div>
    </AdminLayout>
  )
}
