'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Overview } from '../../components/Overview'
import { UserInfo } from '../../components/UserInfo'
import { BranchList } from '../../components/BranchList'
import { Header } from '@/app/components/Header'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BranchOverview } from '../../components/BranchOverview'
import { api } from '@/services/api'
import { toast } from 'react-hot-toast'

interface BranchDashboardData {
  overview: {
    total_amount: number;
    total_reports: number;
    user_data: {
      username: string;
      telp: string;
    };
  };
  branches: Array<{
    id_branch: string;
    name: string;
    clusters: Array<{
      id_cluster: string;
      total_usage: number;
      percentage: number;
    }>;
  }>;
}

interface ClusterData {
  id_cluster: string
  cluster: string
}

export default function AdminBranchDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<BranchDashboardData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [clusters, setClusters] = useState<ClusterData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [clusterData, setClusterData] = useState<ClusterData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.branch) return
      
      try {
        setIsLoading(true)
        console.log('Fetching clusters for branch:', user.branch)
        
        const clusters = await api.getBranchClusters(user.branch.toString())
        console.log('Received clusters:', clusters)
        
        if (!Array.isArray(clusters)) {
          throw new Error('Invalid cluster data format')
        }
        
        setClusterData(clusters)
        
        // Fetch usage data untuk bulan ini
        const now = new Date()
        const month = now.toLocaleString('id-ID', { month: 'long' })
        const year = now.getFullYear().toString()
        
        const dashboardResponse = await fetch(
          `/api/admin/branches/${user.branch}/dashboard/?month=${month}&year=${year}`,
          {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        )
        
        if (!dashboardResponse.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const dashboardData = await dashboardResponse.json()
        
        // Combine data
        const combinedData = clusters.map(cluster => ({
          ...cluster,
          total_usage: dashboardData.branches?.[0]?.clusters?.find(
            (c: { id_cluster: string }) => c.id_cluster === cluster.id_cluster
          )?.total_usage || 0,
          percentage: dashboardData.branches?.[0]?.clusters?.find(
            (c: { id_cluster: string }) => c.id_cluster === cluster.id_cluster
          )?.percentage || 0
        }))
        
        setClusterData(combinedData)
        setDashboardData(dashboardData)
        
      } catch (error: any) {
        console.error('Error fetching data:', error)
        toast.error(error.message || 'Gagal memuat data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.branch])

  const handleClusterClick = (clusterId: string) => {
    console.log('Redirecting to cluster:', clusterId)
    router.push(`/dashboard/admin/cluster/${clusterId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
          <div className="bg-gradient-to-r from-[#FF4B2B] to-[#FF9F1C] rounded-xl p-6 shadow-sm">
            <UserInfo 
              username={user?.username || ''}
              phone=""
              marketingFee={dashboardData?.overview.total_amount || 0}
              role="admin_branch"
            />
          </div>

          {/* Pie Chart Overview */}
          {dashboardData?.clusters && (
            <BranchOverview 
              data={{ 
                clusters: dashboardData.clusters 
              }} 
            />
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-black">Pilihan Branch</h2>
            {dashboardData?.branches && (
              <BranchList
                data={dashboardData.branches.map(branch => ({
                  id: branch.id_branch,
                  name: branch.name,
                  totalUsage: branch.clusters[0]?.total_usage || 0,
                  percentage: branch.clusters[0]?.percentage || 0
                }))}
                onBranchSelect={(clusterId: string) => router.push(`/dashboard/admin/cluster/${clusterId}`)}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clusterData.map((cluster) => (
              <div
                key={cluster.id_cluster}
                className="bg-white text-black rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{cluster.cluster}</h3>
                  <button
                    onClick={() => handleClusterClick(cluster.id_cluster.toString())}
                    className="text-orange-600 hover:underline text-sm"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function getCurrentMonth() {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[new Date().getMonth()]
}

function getCurrentYear() {
  return new Date().getFullYear().toString()
} 