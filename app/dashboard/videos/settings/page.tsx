import { AdminLayout } from '@/components/admin-layout'
import { VideoSettings } from '@/components/video-settings'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Settings | Video Management',
  description: 'Manage video settings and subscriptions',
}

export default async function VideoSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage video settings and subscription plans.
            </p>
          </div>
          <Link href="/dashboard/videos">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Videos
            </Button>
          </Link>
        </div>

        <VideoSettings />
      </div>
    </AdminLayout>
  )
}

