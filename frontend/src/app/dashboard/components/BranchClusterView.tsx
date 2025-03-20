'use client'

import { useState, useEffect } from 'react'
import { Overview } from './Overview'
import { UsageDetails } from './UsageDetails'
import { LoadingSpinner } from './LoadingSpinner'
import { api } from '@/services/api'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

interface BranchClusterViewProps {
  clusterId: string
}

interface DashboardData {
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
}

export function BranchClusterView({ clusterId }: BranchClusterViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return new Date().toLocaleString('id-ID', { month: 'long' })
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear())
  })
  const [poinTypes, setPoinTypes] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [clusterId, selectedMonth, selectedYear])

  useEffect(() => {
    const fetchPoinTypes = async () => {
      try {
        const response = await fetch('/api/poin-types')
        const data = await response.json()
        setPoinTypes(data)
      } catch (error) {
        console.error('Error fetching poin types:', error)
        toast.error('Failed to load poin types')
      }
    }
    fetchPoinTypes()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/admin/branch/clusters/${clusterId}/dashboard/?month=${selectedMonth}&year=${selectedYear}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setDashboardData(data)
      console.log('Dashboard data:', data) // Debug log
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

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
                  Rp {(dashboardData?.overview?.total_amount || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-sm opacity-80">
                  {(dashboardData?.overview?.total_amount || 0).toLocaleString('id-ID')} / {(dashboardData?.marketing_fee || 0).toLocaleString('id-ID')}
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
      </div>
    </div>
  )
} 