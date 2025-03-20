'use client'

interface RegionData {
  id_region: string
  name: string
  total_usage: number
  total_marketing_fee: number
  usage_percentage: number
}

interface RegionListProps {
  regions: RegionData[]
  onRegionSelect: (regionId: string) => void
}

export function RegionList({ regions, onRegionSelect }: RegionListProps) {
  return (
    <div className="space-y-4">
      {regions.map((region) => (
        <div key={region.id_region} className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{region.name}</h3>
              <div className="mt-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Marketing Fee:</span>
                  <span>Rp {region.total_marketing_fee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Usage:</span>
                  <span>Rp {region.total_usage.toLocaleString('id-ID')}</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Usage Percentage</span>
                    <span>{Math.min(region.usage_percentage, 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        region.usage_percentage > 100 ? 'bg-red-500' : 'bg-orange-500'
                      }`}
                      style={{ 
                        width: `${Math.min(region.usage_percentage, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => onRegionSelect(region.id_region)}
              className="ml-4 px-4 py-2 text-sm text-white bg-orange-500 rounded-lg 
                         hover:bg-orange-600 transition-colors"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 