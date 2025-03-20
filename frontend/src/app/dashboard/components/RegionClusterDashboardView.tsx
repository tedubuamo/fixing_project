'use client'

import { useState, useEffect } from 'react'
import { Overview } from './Overview'
import { UsageDetails } from './UsageDetails'
import { LoadingSpinner } from './LoadingSpinner'
import { api } from '@/services/api'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { UserInfo } from './UserInfo'
import { MarketingFeeInput } from './MarketingFeeInput'

interface RegionClusterDashboardData {
  overview: {
    total_reports: number
    total_amount: number
    user_data: {
      username: string
      telp: string
    }
  }
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
  usage_details: Array<{
    id_poin: number
    type: string
    total_amount: number
    percentage: number
    recommendation: number
  }>
  reports: Array<{
    id: number
    id_user_id: number
    id_poin_id: number
    description: string
    amount_used: number
    image_url: string
    time: string
    status: boolean
    approved_at: string | null
  }>
  marketing_fee: number
}

interface RegionClusterDashboardViewProps {
  clusterId: string
}

export function RegionClusterDashboardView({ clusterId }: RegionClusterDashboardViewProps) {
  const [dashboardData, setDashboardData] = useState<RegionClusterDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    return months[new Date().getMonth()]
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString()
  })
  const [poinTypes, setPoinTypes] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchPoinTypes()
  }, [clusterId, selectedMonth, selectedYear])

  const fetchDashboardData = async () => {
    try {
      const monthNumber = getMonthNumber(selectedMonth)
      
      const response = await fetch(
        `/api/admin/region/clusters/${clusterId}/dashboard?month=${monthNumber}&year=${selectedYear}`,
        {
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      
      // Langsung gunakan data dari backend tanpa konversi
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Gagal memuat data dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPoinTypes = async () => {
    try {
      const response = await fetch('/api/poin-types/', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch poin types')
      const data = await response.json()
      setPoinTypes(data)
    } catch (error) {
      console.error('Error fetching poin types:', error)
    }
  }

  // Hitung total amount dari usage_details
  const totalAmount = dashboardData?.usage_details?.reduce(
    (sum, item) => sum + (item.total_amount || 0), 
    0
  ) || 0

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-8">
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
                  Rp {totalAmount.toLocaleString('id-ID')}
                </p>
                <p className="text-sm opacity-80">
                  {totalAmount.toLocaleString('id-ID')} / {dashboardData?.marketing_fee.toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-80">User</p>
                <p className="text-lg font-semibold">
                  {dashboardData?.overview?.user_data?.username}
                </p>
                <p className="text-sm">
                  {dashboardData?.overview?.user_data?.telp}
                </p>
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
            poinTypes={poinTypes}
            selectedCluster={clusterId}
          />
        </div>

        <div className="mt-6">
          <MarketingFeeInput 
            clusterId={clusterId}
            totalFee={totalAmount}
            currentFee={dashboardData?.marketing_fee || 0}
            month={selectedMonth}
            year={selectedYear}
            onUpdate={fetchDashboardData}
          />
        </div>
      </div>
    </div>
  )
}

function getCurrentMonth(): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[new Date().getMonth()]
}

function getCurrentYear(): string {
  return new Date().getFullYear().toString()
}

function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'Januari': 1,
    'Februari': 2,
    'Maret': 3,
    'April': 4,
    'Mei': 5,
    'Juni': 6,
    'Juli': 7,
    'Agustus': 8,
    'September': 9,
    'Oktober': 10,
    'November': 11,
    'Desember': 12
  }
  return months[monthName] || 1
} 