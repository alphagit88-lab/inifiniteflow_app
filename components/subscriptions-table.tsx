'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Subscription, getSubscriptions, deleteSubscription } from '@/app/actions/subscriptions'
import { EditSubscriptionDialog } from './edit-subscription-dialog'
import { AddSubscriptionDialog } from './add-subscription-dialog'
import { Edit, Trash2, Plus } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch data when component mounts or when refreshKey changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getSubscriptions()
        if (result.success && result.data) {
          setSubscriptions(result.data)
        } else if (result.error) {
          setError('Failed to load subscriptions: ' + result.error)
        }
      } catch (e) {
        setError('An unexpected error occurred during fetch.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (subscription) =>
        subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscription.description?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        subscription.tier_level.toString().includes(searchTerm) ||
        subscription.price_usd.toString().includes(searchTerm)
    )
  }, [subscriptions, searchTerm])

  const handleSubscriptionUpdated = (updatedSubscription: Subscription) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.subscription_id === updatedSubscription.subscription_id ? updatedSubscription : s))
    )
    setEditingSubscription(null)
  }

  const handleSubscriptionAdded = () => {
    setRefreshKey((prev) => prev + 1)
    setIsAddDialogOpen(false)
  }

  const handleDeleteClick = (subscription: Subscription) => {
    setDeletingSubscription(subscription)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSubscription) return

    setIsDeleting(true)
    try {
      const result = await deleteSubscription(deletingSubscription.subscription_id)
      if (result.success) {
        setSubscriptions((prev) => prev.filter((s) => s.subscription_id !== deletingSubscription.subscription_id))
        setDeletingSubscription(null)
      } else {
        alert('Failed to delete subscription: ' + result.error)
      }
    } catch (err) {
      alert('An unexpected error occurred while deleting the subscription.')
      console.error('Delete error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleActiveStatus = async (subscription: Subscription) => {
    try {
      const { updateSubscription } = await import('@/app/actions/subscriptions')
      const result = await updateSubscription({
        subscription_id: subscription.subscription_id,
        is_active: !subscription.is_active,
      })
      if (result.success && result.data) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.subscription_id === subscription.subscription_id ? result.data! : s))
        )
      } else {
        alert('Failed to update subscription: ' + result.error)
      }
    } catch (err) {
      alert('An unexpected error occurred while updating the subscription.')
      console.error('Update error:', err)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Loading subscriptions...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">{error}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search subscriptions by name, description, tier, or price..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tier Level</TableHead>
              <TableHead>Duration (Months)</TableHead>
              <TableHead>Price (USD)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No subscriptions found matching your search.' : 'No subscriptions found. Add your first subscription!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.subscription_id}>
                  <TableCell className="font-medium">{subscription.name}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={subscription.description || 'No description'}>
                      {subscription.description || <span className="text-muted-foreground italic">No description</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Tier {subscription.tier_level}</Badge>
                  </TableCell>
                  <TableCell>{subscription.duration_months}</TableCell>
                  <TableCell>${subscription.price_usd.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant={subscription.is_active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleActiveStatus(subscription)}
                      className={subscription.is_active ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {subscription.is_active ? 'Active' : 'Inactive'}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSubscription(subscription)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(subscription)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AddSubscriptionDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubscriptionAdded={handleSubscriptionAdded}
      />

      <EditSubscriptionDialog
        subscription={editingSubscription}
        onClose={() => setEditingSubscription(null)}
        onSubscriptionUpdated={handleSubscriptionUpdated}
      />

      <AlertDialog open={!!deletingSubscription} onOpenChange={(open) => !open && setDeletingSubscription(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subscription? This action cannot be undone.
              {deletingSubscription && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <span className="text-sm font-medium">{deletingSubscription.name}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="border-2 border-destructive text-destructive bg-transparent hover:bg-destructive/10 hover:border-destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

