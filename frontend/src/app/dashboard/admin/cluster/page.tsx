'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/services/api'
import { Overview } from '@/app/dashboard/components/Overview'
import { Header } from '@/app/components/Header'
import { UsageDetails } from '@/app/dashboard/components/UsageDetails'
import { toast } from 'react-hot-toast'

interface ClusterDashboardData {
  overview: {
    total_reports: number
    total_amount: number
    user_data: {
      username: string
      telp: string
    }
  }
  usage_details: any[]
  monthlyData: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }[]
  }
}

export default function AdminClusterDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<ClusterDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleString('id-ID', { month: 'long' })
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear())
  })

  const fetchDashboardData = useCallback(async () => {
    if (!user?.cluster) return

    try {
      setIsLoading(true)
      const data = await api.getClusterDashboardData(
        user.cluster.toString(),
        selectedMonth,
        selectedYear
      )
      setDashboardData(data)
    } catch (error) {
      toast.error('Gagal memuat data dashboard')
      setDashboardData({
        overview: {
          total_reports: 0,
          total_amount: 0,
          user_data: {
            username: user?.username || '',
            telp: user?.phone || ''
          }
        },
        usage_details: [],
        monthlyData: {
          labels: [selectedMonth],
          datasets: [{
            label: 'Total Marketing Fee',
            data: [0],
            borderColor: '#FF4B2B',
            backgroundColor: 'rgba(255, 75, 43, 0.1)'
          }]
        }
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.cluster, selectedMonth, selectedYear, user?.username, user?.phone])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-gradient-to-r from-[#FF4B2B] to-[#FF7F50] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <div className="text-white">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm opacity-80">Total Reports</p>
                <p className="text-2xl font-semibold">{dashboardData?.overview.total_reports || 0}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Total Amount</p>
                <p className="text-2xl font-semibold">
                  Rp {(dashboardData?.overview.total_amount || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-sm opacity-80">
                  {(dashboardData?.overview.total_amount || 0).toLocaleString('id-ID')} / {(dashboardData?.marketing_fee || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">User</p>
                <p className="text-lg font-semibold">{dashboardData?.overview.user_data.username}</p>
                <p className="text-sm">{dashboardData?.overview.user_data.telp}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <Overview 
            data={dashboardData?.monthlyData} 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <UsageDetails 
            data={dashboardData?.usage_details?.map(item => ({
              id: item.id_poin.toString(),
              name: item.type,
              amount: `Rp ${item.total_amount.toLocaleString('id-ID')}`,
              percentage: item.percentage,
              recommendation: item.recommendation,
              color: '#F97316',
              rawAmount: item.total_amount
            })) || []}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            poinTypes={[]}
            selectedCluster={user?.cluster?.toString()}
          />
        </div>
      </div>
    </div>
  )
} 