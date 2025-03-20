'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { Overview } from '../components/Overview'
import { UsageDetails } from '../components/UsageDetails'
import { ClusterPerformance } from './components/ClusterPerformance'
import { RecommendationList } from './components/RecommendationList'

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user || !isAdmin()) {
      router.push('/auth/login')
    } else {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/dashboard/admin/${user?.cluster}`)
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overview Card */}
          <div className="lg:col-span-2">
            <Overview data={dashboardData?.chartData} />
          </div>

          {/* Cluster Performance */}
          <div>
            <ClusterPerformance data={dashboardData?.clusterPerformance} />
          </div>

          {/* Usage Details */}
          <div>
            <UsageDetails items={dashboardData?.usageItems} />
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2">
            <RecommendationList items={dashboardData?.recommendations} />
          </div>
        </div>
      </div>
    </div>
  )
} 