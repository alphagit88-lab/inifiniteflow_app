import { AdminLayout } from '@/components/admin-layout'
import { VideosDataTable } from '@/components/videos-data-table'
import { VideosPageClient } from '@/components/videos-page-client'
import { getVideos } from '@/app/actions/mux'

export const metadata = {
  title: 'Video Management | Admin',
  description: 'Upload and manage videos',
}

export default async function VideosPage() {
  // Fetch videos on the server side
  const videosResult = await getVideos()
  const initialVideos = videosResult.success && videosResult.data ? videosResult.data : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Video Management</h1>
            <p className="text-muted-foreground mt-2">
              Upload videos to Mux for processing and hosting. All video metadata is stored in Supabase.
            </p>
          </div>
        </div>

        <VideosPageClient initialVideos={initialVideos} />
      </div>
    </AdminLayout>
  )
}

