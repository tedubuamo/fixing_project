'use client'

import { useState, useEffect } from 'react'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface BranchUsageData {
  id_branch: string
  name: string
  totalUsage: number
  percentage: number
}

interface RegionOverviewProps {
  data?: {
    branches: BranchUsageData[]
  }
}

export function RegionOverview({ data }: RegionOverviewProps) {
  const [chartData, setChartData] = useState<ChartData<'pie'>>({
    labels: [],
    datasets: []
  })

  useEffect(() => {
    if (data?.branches) {
      setChartData({
        labels: data.branches.map(branch => branch.name),
        datasets: [{
          data: data.branches.map(branch => branch.totalUsage),
          backgroundColor: [
            '#FF4B2B',
            '#FF9F1C',
            '#00C49F',
            '#0088FE',
            '#FFBB28',
            '#FF8042'
          ],
          borderWidth: 0
        }]
      })
    }
  }, [data])

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-6 text-black">Branch Usage Overview</h2>
      <div className="h-[400px] flex items-center justify-center">
        <div className="w-[80%] max-w-[400px]">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
} 