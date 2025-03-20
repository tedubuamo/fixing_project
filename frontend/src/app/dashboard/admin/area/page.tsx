'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { Header } from '@/app/components/Header'
import { UserInfo } from '../../components/UserInfo'
import { AreaOverview } from '../../components/AreaOverview'
import { RegionList } from '../../components/RegionList'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface AreaDashboardData {
  overview: {
    total_marketing_fee: number
    total_usage: number
    usage_percentage: number
    total_reports: number
    pending_approvals: number
  }
  regions: Array<{
    id_region: string
    name: string
    total_marketing_fee: number
    total_usage: number
    usage_percentage: number
  }>
  pending_reports: Array<{
    id_report: number
    description: string
    amount: number
    time: string
    user: {
      username: string
      cluster: string
      branch: string
      region: string
    }
    poin: string
  }>
}

export default function AreaDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<AreaDashboardData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Konversi bulan ke angka
        const monthNumber = getMonthNumber(selectedMonth)
        
        const response = await fetch(
          `/api/admin/area/1/dashboard/?month=${monthNumber}&year=${selectedYear}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching area dashboard:', error)
        toast.error('Gagal memuat data dashboard')
      }
    }

    if (user?.role === 'admin_area') {
      fetchData()
    } else {
      router.push('/auth/login')
    }
  }, [user, selectedMonth, selectedYear, router])

  const handleRegionSelect = (regionId: string) => {
    router.push(`/dashboard/admin/region/${regionId}`)
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
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
              username={user?.username || ''}
              phone=""
              marketingFee={dashboardData?.overview?.total_usage || 0}
              role="admin_area"
              user={user ? { role_id: Number(user.role) } : undefined}
            />
          </div>

          {/* Region Usage Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <AreaOverview regions={dashboardData?.regions || []} />
          </div>

          {/* Region List */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-black">Regions</h2>
              <div className="flex gap-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm text-black"
                >
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm text-black"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <RegionList
              regions={dashboardData.regions}
              onRegionSelect={handleRegionSelect}
            />
          </div>
        </motion.div>
      </main>
    </div>
  )
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = ['2024', '2025']

function getCurrentMonth() {
  return months[new Date().getMonth()]
}

function getCurrentYear() {
  return new Date().getFullYear().toString()
}

// Helper function untuk konversi bulan
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