'use client'

interface UserCardProps {
  name: string;
  role: string;
  totalUsage: number;
  percentage: number;
  id?: string;
  onDetailClick?: (id: string) => void;
}

export function UserCard({ 
  name, 
  role, 
  totalUsage, 
  percentage, 
  id,
  onDetailClick 
}: UserCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-lg text-black">{name}</h3>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
        {id && onDetailClick && (
          <button
            onClick={() => onDetailClick(id)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg 
                      hover:from-orange-600 hover:to-red-600 transition-all duration-300"
          >
            Detail
          </button>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-black">
          Total Penggunaan: {' '}
          <span className="font-medium text-black">
            {totalUsage.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR'
            })}
          </span>
        </p>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-black">Progress</span>
            <span className="font-medium text-black">
              {Math.round(percentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full 
                         transition-all duration-300 ease-in-out"
              style={{ 
                width: `${percentage}%`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 