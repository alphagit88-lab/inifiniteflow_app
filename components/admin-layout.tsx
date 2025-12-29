import { AdminSidebar } from './admin-sidebar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-card h-20 flex items-center px-8">
          <h2 className="text-2xl font-bold text-foreground text-balance">Welcome, Admin!</h2>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
