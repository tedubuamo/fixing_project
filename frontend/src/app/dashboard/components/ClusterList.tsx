'use client'

interface ClusterData {
  id_cluster: string
  name: string
  totalUsage: number
  percentage: number
}

interface ClusterListProps {
  clusters: ClusterData[]
  onClusterSelect: (clusterId: string) => void
}

export function ClusterList({ clusters, onClusterSelect }: ClusterListProps) {
  return (
    <div className="space-y-4">
      {clusters.map((cluster) => (
        <div key={cluster.id_cluster} className="border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{cluster.name}</span>
                <span className="text-sm text-gray-600">
                  Rp {cluster.totalUsage.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-300"
                  style={{ width: `${cluster.percentage}%` }}
                />
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-500">
                  {cluster.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <button
              onClick={() => onClusterSelect(cluster.id_cluster)}
              className="ml-4 px-3 py-1.5 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 