'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { UserInfo } from './UserInfo'
import { BranchOverview } from './BranchOverview'
import { UserCard } from './UserCard'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { BranchList } from './BranchList'

interface ClusterDashboardData {
  branchName: string;
  overview: {
    total_amount: number;
    total_reports: number;
  };
  clusters: Array<{
    id_cluster: string;
    name: string;
    totalUsage: number;
    percentage: number;
  }>;
}

interface RegionClusterViewProps {
  branchId: string;
}

export function RegionClusterView({ branchId }: RegionClusterViewProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<ClusterDashboardData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleString('id-ID', { month: 'long' })
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear())
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/branches/${branchId}/dashboard/?month=${selectedMonth}&year=${selectedYear}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [branchId, selectedMonth, selectedYear])

  const handleClusterClick = async (clusterId: string) => {
    try {
      // Check access dulu
      const accessResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/branch/${branchId}/clusters/check-access/${clusterId}/`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )

      if (!accessResponse.ok) {
        throw new Error('Access denied')
      }

      // Redirect ke dashboard cluster region
      router.push(`/dashboard/admin/region/cluster-dashboard/${clusterId}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('You do not have access to this cluster')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8">
        {/* User Info Card */}
        <div className="bg-gradient-to-r from-[#FF4B2B] to-[#FF7F50] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <div className="text-white">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm opacity-80">Total Reports</p>
                <p className="text-2xl font-semibold">
                  {dashboardData?.overview?.total_reports || 0}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">Total Amount</p>
                <p className="text-2xl font-semibold">
                  Rp {(dashboardData?.overview?.total_amount || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">Branch</p>
                <p className="text-lg font-semibold">
                  {dashboardData?.branchName || ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Usage Overview */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <BranchOverview data={{ clusters: dashboardData?.clusters || [] }} />
        </div>

        {/* Cluster List */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-black">Clusters</h2>
          <BranchList
            data={dashboardData?.clusters.map(cluster => ({
              id: cluster.id_cluster,
              name: cluster.name,
              totalUsage: cluster.totalUsage,
              percentage: cluster.percentage
            })) || []}
            onBranchSelect={(clusterId) => router.push(
              `/dashboard/admin/region/cluster/${clusterId}?branchId=${branchId}`
            )}
          />
        </div>
      </div>
    </div>
  )
} 