'use client'

import { useState, useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'

interface HierarchyData {
  id: string
  name: string
  totalUsage: number
  percentage: number
  branches?: {
    id: string
    name: string
    totalUsage: number
    percentage: number
    clusters?: {
      id: string
      name: string
      totalUsage: number
      percentage: number
    }[]
  }[]
}

interface Branch {
  id: string
  name: string
  totalUsage: number
  percentage: number
}

interface AdminDashboardProps {
  selectedMonth?: string
  selectedYear?: string
  onMonthChange?: (month: string) => void
  onYearChange?: (year: string) => void
}

export function AdminDashboard({ 
  selectedMonth, 
  selectedYear,
  onMonthChange,
  onYearChange 
}: AdminDashboardProps) {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/admin/cluster/dashboard?month=${selectedMonth}&year=${selectedYear}`,
          {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedMonth, selectedYear])

  const fetchHierarchyData = async () => {
    try {
      const response = await fetch('/api/admin/hierarchy', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hierarchy data: ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Hierarchy data:', result) // Debug
      setData(result)
    } catch (error) {
      console.error('Error fetching hierarchy data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSelectedRegion = () => {
    return data?.hierarchy?.find((r: HierarchyData) => r.id === selectedRegion)
  }

  const getSelectedBranch = () => {
    const region = getSelectedRegion()
    return region?.branches?.find((b: Branch) => b.id === selectedBranch)
  }

  const handleClusterSelect = (clusterId: string) => {
    router.push(`/dashboard/admin/cluster/${clusterId}`)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Hi, Admin!</h1>
        <p className="text-gray-600">(Area)</p>
      </div>

      {/* Overview Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="w-full max-w-md mx-auto">
          {data?.hierarchy && data.hierarchy.length > 0 ? (
            <Pie 
              data={{
                labels: data.hierarchy.map((r: HierarchyData) => r.name),
                datasets: [{
                  data: data.hierarchy.map((r: HierarchyData) => r.percentage),
                  backgroundColor: [
                    '#84cc16', '#fb923c', '#84cc16', '#fb923c', '#84cc16', '#fb923c'
                  ]
                }]
              }}
              options={{ 
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          ) : (
            <p className="text-center text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Pilihan Region Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Pilihan Region</h2>
        <div className="space-y-4">
          {data?.hierarchy?.map((region: HierarchyData) => (
            <div key={region.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{region.name}</span>
                    <span>{Math.round(region.percentage)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        region.percentage >= 70 ? 'bg-[#84cc16]' : 
                        region.percentage >= 50 ? 'bg-[#fb923c]' : 
                        'bg-[#84cc16]'
                      }`}
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRegion(region.id)}
                  className="ml-4 px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Pilih Branch
                </button>
              </div>

              {/* Branch List */}
              {selectedRegion === region.id && region.branches && (
                <div className="ml-8 mt-4 space-y-4">
                  {region.branches.map(branch => (
                    <div key={branch.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{branch.name}</span>
                            <span>{Math.round(branch.percentage)}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-400"
                              style={{ width: `${branch.percentage}%` }}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedBranch(branch.id)}
                          className="ml-4 px-3 py-1 text-sm text-blue-600 hover:underline"
                        >
                          Lihat
                        </button>
                      </div>

                      {/* Cluster List */}
                      {selectedBranch === branch.id && branch.clusters && (
                        <div className="ml-8 mt-4 space-y-4">
                          {branch.clusters.map(cluster => (
                            <div key={cluster.id}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{cluster.name}</span>
                                    <span>{Math.round(cluster.percentage)}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-400"
                                      style={{ width: `${cluster.percentage}%` }}
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleClusterSelect(cluster.id)}
                                  className="ml-4 px-3 py-1 text-sm text-blue-600 hover:underline"
                                >
                                  Dashboard
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 