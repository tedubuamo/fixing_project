'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Overview } from './components/Overview'
import { UsageDetails } from './components/UsageDetails'
import { UserInfo } from './components/UserInfo'
import { motion } from 'framer-motion'
import { AdminDashboard } from './components/AdminDashboard'
import { AdminClusterDashboard } from './components/AdminClusterDashboard'
import { api } from '@/services/api'
import { toast } from 'react-hot-toast'

interface DashboardData {
  username: string;
  phone: string;
  marketingFee: number;
  role: string;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
  usageItems: Array<{
    id: string;
    name: string;
    percentage: number;
    amount: string;
    color: string;
  }>;
  totalSaldo: string;
  saldoPercentage: number;
}

interface MarketingFeeData {
  total: number;
  sectorTotals: Record<string, number>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [marketingFeeData, setMarketingFeeData] = useState<MarketingFeeData>({
    total: 0,
    sectorTotals: {}
  })
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().toLocaleString('id-ID', { month: 'long' })
    return currentMonth
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString()
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (user?.role === 'admin_cluster_mcot') {
    return <AdminClusterDashboard />
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        const data = await api.getDashboardData(
          user.id.toString(),
          selectedMonth,
          selectedYear
        )
        const transformedData = transformDashboardData(data)
        setDashboardData({
          ...transformedData,
          role: user.role || 'user'
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Gagal memuat data dashboard')
      }
    }

    fetchDashboardData()
  }, [user, selectedMonth, selectedYear])

  const getRandomColor = (index: number) => {
    const colors = ['#FF4B2B', '#FF9F1C', '#00C49F', '#0088FE', '#FFBB28']
    return colors[index % colors.length]
  }

  const getPoinId = (poinName: string): string => {
    const poinMap: Record<string, string> = {
      'AKUISISI': '1',
      'OUTLET': '2',
      'SF': '3',
      'CB PROGRAM': '4',
      'REGION (CVM & SO)': '5',
      'MATPRO': '6',
      'GAMES': '7'
    }
    return poinMap[poinName] || '1'
  }

  const calculatePercentage = (amount: number, total: number) => {
    if (total === 0) return 0
    return (amount / total) * 100
  }

  const refreshData = async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const dashboardData = await api.getDashboardData(
        user.id.toString(),
        selectedMonth,
        selectedYear
      )
      const transformedData = transformDashboardData(dashboardData)
      setDashboardData(transformedData)
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Gagal memperbarui data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMarketingFee = async () => {
    try {
      const response = await fetch(
        `/api/marketing-fee/total?userId=${user?.id}&month=${selectedMonth}&year=${selectedYear}`
      )
      const data = await response.json()
      setMarketingFeeData({
        total: data.total,
        sectorTotals: data.sectorTotals
      })
    } catch (error) {
      console.error('Error fetching marketing fee:', error)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchMarketingFee()
    }
  }, [user, selectedMonth, selectedYear])

  if (isLoading && !user?.role.includes('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="bg-gradient-to-r from-[#FF4B2B] to-[#FF9F1C] rounded-t-3xl p-6"
        variants={itemVariants}
      >
        <UserInfo 
          username={dashboardData?.username || ''}
          phone={dashboardData?.phone || ''}
          marketingFee={marketingFeeData.total}
          role={dashboardData?.role || user?.role || 'user'}
          user={user}
        />
      </motion.div>
      
      <motion.div 
        className="bg-white rounded-b-3xl p-6 shadow-lg space-y-6"
        variants={itemVariants}
      >
        <motion.div variants={itemVariants}>
          <Overview data={dashboardData?.chartData} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <UsageDetails 
            items={dashboardData?.usageItems || []}
            onDataUpdate={refreshData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="bg-orange-50 rounded-xl p-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${dashboardData?.saldoPercentage || 0}%`
                }}
              />
            </div>
            <div className="text-gray-600 min-w-[100px] text-right">
              {dashboardData?.totalSaldo || 'Rp 0'}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const transformDashboardData = (data: any): DashboardData => {
  return {
    username: data.user_data.username,
    phone: data.user_data.telp,
    marketingFee: data.marketing_fee[0]?.total || 0,
    role: data.user_data.role || 'user',
    chartData: {
      labels: data.report_data.map((item: any) => item.type),
      datasets: [{
        label: 'Marketing Fee',
        data: data.report_data.map((item: any) => item.total_amount),
        borderColor: '#FF4B2B',
        backgroundColor: 'rgba(255, 75, 43, 0.1)',
      }]
    },
    usageItems: data.report_data.map((item: any, index: number) => ({
      id: item.id_poin.toString(),
      name: item.type,
      percentage: item.percentage || 0,
      amount: `Rp ${item.total_amount.toLocaleString('id-ID')}`,
      color: getRandomColor(index)
    })),
    totalSaldo: `Rp ${data.total_fee.toLocaleString('id-ID')}`,
    saldoPercentage: data.percentage_fee * 100
  }
}