'use client'

import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface BranchOverviewProps {
  data: {
    clusters: Array<{
      id_cluster: string;
      name: string;
      totalUsage: number;
      percentage: number;
    }>;
  };
}

export function BranchOverview({ data }: BranchOverviewProps) {
  const chartData = {
    labels: data.clusters.map(cluster => cluster.name),
    datasets: [
      {
        data: data.clusters.map(cluster => cluster.percentage),
        backgroundColor: [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#96CEB4',
          '#FFEEAD',
          '#D4A5A5',
          '#9FA8DA',
          '#FFE082',
          '#A5D6A7',
          '#EF9A9A'
        ],
        borderWidth: 0
      }
    ]
  }

  const options = {
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
      <h2 className="text-lg text-black font-semibold mb-6">Cluster Usage Overview</h2>
      <div className="w-full max-w-md mx-auto">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  )
}