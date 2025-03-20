'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Overview } from './Overview'
import { UsageDetails } from './UsageDetails'
import { UserInfo } from './UserInfo'
import { motion } from 'framer-motion'

interface AdminDashboardData {
  username: string
  clusterName: string
  totalMarketingFee: number
  monthlyData: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }[]
  }
  usageItems: {
    id: string
    name: string
    percentage: number
    amount: string
    color: string
  }[]
}

export function AdminClusterDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/admin/cluster/${user?.cluster}/dashboard?month=${selectedMonth}&year=${selectedYear}`
      )
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.cluster) {
      fetchDashboardData()
    }
  }, [user?.cluster, selectedMonth, selectedYear])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <UserInfo 
        username={dashboardData?.username || ''}
        phone=""
        marketingFee={dashboardData?.totalMarketingFee || 0}
        role="admin_cluster_mcot"
      />

      <div className="mt-6 space-y-6">
        <Overview data={dashboardData?.monthlyData} />
        
        <UsageDetails 
          items={dashboardData?.usageItems || []} 
          onDataUpdate={fetchDashboardData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          isAdmin={true}
        />
      </div>
    </motion.div>
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