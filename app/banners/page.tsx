'use client'

import { AdminLayout } from '@/components/admin-layout'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ClassBannersTab } from '@/components/class-banners-tab'
import { RecipesBannersTab } from '@/components/recipes-banners-tab'

export default function BannersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Banner Settings</h1>
          <p className="text-muted-foreground">Manage banners and their display order</p>
        </div>

        <Tabs defaultValue="class-banners" className="w-full">
          <TabsList>
            <TabsTrigger value="class-banners">Class Banners</TabsTrigger>
            <TabsTrigger value="recipes-banners">Recipes Banners</TabsTrigger>
          </TabsList>
          
          <TabsContent value="class-banners" className="mt-6">
            <ClassBannersTab />
          </TabsContent>
          
          <TabsContent value="recipes-banners" className="mt-6">
            <RecipesBannersTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}

