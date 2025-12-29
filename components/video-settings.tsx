'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionsTable } from './subscriptions-table'
import { AllergiesTable } from './allergies-table'
import { DietaryPreferencesTable } from './dietary-preferences-table'
import { EquipmentTable } from './equipment-table'

export function VideoSettings() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="dietary-preferences">Dietary Preferences</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionsTable />
        </TabsContent>
        <TabsContent value="allergies" className="mt-6">
          <AllergiesTable />
        </TabsContent>
        <TabsContent value="dietary-preferences" className="mt-6">
          <DietaryPreferencesTable />
        </TabsContent>
        <TabsContent value="equipment" className="mt-6">
          <EquipmentTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}

