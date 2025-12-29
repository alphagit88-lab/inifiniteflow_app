import { AdminLayout } from '@/components/admin-layout'
import { getUserProfiles } from '@/actions/profiles'
import { getInstructors } from '@/actions/instructors'
import { getClasses } from '@/actions/classes'
import Link from 'next/link'
import { Users, GraduationCap, BookOpen, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SubscriptionPlanChart, SubscriptionPlanChartDatum } from '@/components/subscription-plan-chart'

export const metadata = {
  title: 'Dashboard | Admin',
  description: 'Main dashboard view',
}

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [usersResult, instructorsResult, classesResult] = await Promise.all([
    getUserProfiles(),
    getInstructors(),
    getClasses(),
  ])

  const users = usersResult.success && usersResult.data ? usersResult.data : []
  const activeUsers = users.filter((user) => user.subscription_status?.toLowerCase() === 'active')
  const totalActiveUsers = activeUsers.length

  const PLAN_DEFINITIONS = [
    { id: 1, label: 'Free' },
    { id: 2, label: 'Monthly' },
    { id: 3, label: '3 Months' },
    { id: 4, label: 'Annual' },
  ] as const

  type PlanLabel = (typeof PLAN_DEFINITIONS)[number]['label']

  const planCounts = PLAN_DEFINITIONS.reduce<Record<PlanLabel, number>>((acc, plan) => {
    acc[plan.label] = 0
    return acc
  }, {} as Record<PlanLabel, number>)

  for (const user of activeUsers) {
    const planLabel =
      PLAN_DEFINITIONS.find((plan) => plan.id === user.subscription_plan)?.label ||
      PLAN_DEFINITIONS[0].label
    planCounts[planLabel] += 1
  }

  const subscriptionChartData: SubscriptionPlanChartDatum[] = PLAN_DEFINITIONS.map(({ label }) => ({
    name: label as SubscriptionPlanChartDatum['name'],
    value: planCounts[label] || 0,
  }))

  const instructorCount = instructorsResult.success && instructorsResult.data ? instructorsResult.data.length : 0
  const classCount = classesResult.success && classesResult.data ? classesResult.data.length : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard. View key metrics and manage your platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users Card */}
          <Link href="/users" className="group">
            <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Active Users</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{totalActiveUsers.toLocaleString()}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>

          {/* Instructors Card */}
          <Link href="/instructors" className="group">
            <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Instructors</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{instructorCount.toLocaleString()}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>

          {/* Classes Card */}
          <Link href="/classes" className="group">
            <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:border-primary cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Classes</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{classCount.toLocaleString()}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        </div>

        <Card className="p-6">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="md:w-1/3 space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">Active Subscribers by Plan</h2>
              <p className="text-muted-foreground text-sm">
                Current breakdown of subscribers with an active status across each available plan.
              </p>
              <div>
                <p className="text-4xl font-bold text-foreground">{totalActiveUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total active users</p>
              </div>
            </div>
            <div className="flex-1">
              <SubscriptionPlanChart data={subscriptionChartData} />
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
