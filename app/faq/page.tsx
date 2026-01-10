'use client'

import { AdminLayout } from '@/components/admin-layout'
import { HelpFaqTab } from '@/components/help-faq-tab'

export default function FaqPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">FAQ Management</h1>
          <p className="text-muted-foreground">Manage frequently asked questions and their display order</p>
        </div>

        <HelpFaqTab />
      </div>
    </AdminLayout>
  )
}
