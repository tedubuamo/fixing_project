'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/services/api'
import { Overview } from '@/app/dashboard/components/Overview'
import { Header } from '@/app/components/Header'
import { UsageDetails } from '@/app/dashboard/components/UsageDetails'
import { UserInfo } from '@/app/dashboard/components/UserInfo'
import { toast } from 'react-hot-toast'

interface DashboardData {
  overview: {
    total_reports: number
    total_amount: number
    user_data: {
      username: string
      telp: string
    }
  }
  marketing_fee: number
  usage_details: Array<{
    id_poin: number
    type: string
    total_amount: number
    percentage: number
    recommendation: number
  }>
  reports: any[]
  monthlyData: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      tension: number
    }>
  }
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleString('id-ID', { month: 'long' })
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear())
  })

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      console.log('Fetching dashboard data...', {
        userId: user.id,
        month: selectedMonth,
        year: selectedYear
      })

      const data = await api.getDashboardData(
        user.id.toString(),
        selectedMonth,
        selectedYear
      )

      console.log('Dashboard data received:', data)
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Gagal memuat data dashboard')
      setDashboardData({
        overview: {
          total_reports: 0,
          total_amount: 0,
          user_data: {
            username: user.username || '',
            telp: user.telp || ''
          }
        },
        marketing_fee: 0,
        usage_details: [],
        reports: [],
        monthlyData: {
          labels: [selectedMonth],
          datasets: [{
            label: 'Total Marketing Fee',
            data: [0],
            borderColor: '#FF4B2B',
            backgroundColor: 'rgba(255, 75, 43, 0.1)',
            tension: 0.4
          }]
        }
      })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, selectedMonth, selectedYear])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const usageDetailsFormatted = dashboardData?.usage_details.map(item => ({
    id: item.id_poin.toString(),
    name: item.type,
    amount: `Rp ${item.total_amount.toLocaleString('id-ID')}`,
    percentage: item.percentage,
    recommendation: item.recommendation,
    color: '#F97316'
  })) || []

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-gradient-to-r from-[#FF4B2B] to-[#FF7F50] rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
          <UserInfo 
            username={dashboardData?.overview.user_data.username || ''}
            phone={dashboardData?.overview.user_data.telp || ''}
            marketingFee={dashboardData?.marketing_fee || 0}
            totalUsage={dashboardData?.overview.total_amount}
            role={user?.role || ''}
            user={{ role_id: user?.role_id }}
          />
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
            data={usageDetailsFormatted}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            poinTypes={[]}
          />
        </div>
      </div>
    </div>
  )
}