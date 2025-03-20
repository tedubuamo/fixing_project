'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { BranchList } from '../../../components/BranchList'
import { RegionOverview } from '../../../components/RegionOverview'
import { Header } from '@/app/components/Header'
import { UserInfo } from '../../../components/UserInfo'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface RegionDashboardData {
  regionName: string;
  overview: {
    total_amount: number;
    total_reports: number;
  };
  branches: Array<{
    id_branch: string;
    name: string;
    totalUsage: number;
    percentage: number;
  }>;
}

export default function RegionDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<RegionDashboardData | null>(null)
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
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/regions/${params.id}/dashboard/?month=${selectedMonth}&year=${selectedYear}`,
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

    if (params.id) {
      fetchDashboardData()
    }
  }, [params.id, selectedMonth, selectedYear])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* User Info Card */}
          <div className="bg-gradient-to-r from-[#FF4B2B] to-[#FF9F1C] rounded-xl p-6 shadow-sm">
            <UserInfo 
              username={dashboardData?.regionName || ''}
              phone=""
              marketingFee={dashboardData?.overview?.total_amount || 0}
              role="admin_region"
              user={user ? { role_id: Number(user.role) } : undefined}
            />
          </div>

          {/* Branch Usage Overview */}
          {dashboardData?.branches && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <RegionOverview 
                data={{ 
                  branches: dashboardData.branches || [] 
                }} 
              />
            </div>
          )}

          {/* Branch List */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-black">Pilihan Branch</h2>
            {dashboardData?.branches && (
              <BranchList
                data={dashboardData.branches.map(branch => ({
                  id: branch.id_branch,
                  name: branch.name,
                  totalUsage: branch.totalUsage,
                  percentage: branch.percentage
                }))}
                onBranchSelect={(branchId: string) => router.push(`/dashboard/admin/branch/${branchId}`)}
              />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
} 