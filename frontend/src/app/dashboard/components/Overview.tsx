'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

interface OverviewProps {
  data?: ChartData
  selectedMonth?: string
  selectedYear?: string
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const value = context.raw
          return `Rp ${value.toLocaleString('id-ID')}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number) => `Rp ${value.toLocaleString('id-ID')}`
      }
    }
  }
}

export function Overview({ data, selectedMonth = 'Februari', selectedYear = '2025' }: OverviewProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)

  useEffect(() => {
    if (data?.labels && data?.datasets) {
      // Data sudah dalam format yang benar, langsung gunakan
      setChartData(data)
    } else {
      // Gunakan data default
      const defaultData: ChartData = {
        labels: [`${selectedMonth} ${selectedYear}`],
        datasets: [{
          label: 'Total Marketing Fee',
          data: [0],
          borderColor: '#FF4B2B',
          backgroundColor: 'rgba(255, 75, 43, 0.1)',
          tension: 0.4
        }]
      }
      setChartData(defaultData)
    }
  }, [data, selectedMonth, selectedYear])

  if (!chartData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700 mb-6">Overview</h2>
      <div className="h-[400px]">
        <Line options={options} data={chartData} />
      </div>
    </div>
  )
}