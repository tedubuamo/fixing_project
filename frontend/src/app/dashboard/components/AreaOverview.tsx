'use client'

import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface RegionUsageData {
  id_region: string
  name: string
  total_usage: number
  total_marketing_fee: number
  usage_percentage: number
}

interface AreaOverviewProps {
  regions: RegionUsageData[]
}

export function AreaOverview({ regions }: AreaOverviewProps) {
  const chartData: ChartData<'pie'> = {
    labels: regions.map(region => region.name),
    datasets: [
      {
        data: regions.map(region => region.total_usage),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'black',
          font: {
            size: 12
          }
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-6 text-black">Region Usage Overview</h2>
      <div className="h-[400px] flex items-center justify-center">
        <div className="w-[80%] max-w-[400px]">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </div>
  )
} 