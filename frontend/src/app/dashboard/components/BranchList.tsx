'use client'

import { useState } from 'react'

interface ClusterData {
  id_cluster: number
  cluster: string
  total_usage?: number
  percentage?: number
}

export interface BranchListProps {
  data: Array<{
    id: string;
    name: string;
    totalUsage: number;
    percentage: number;
  }>;
  onBranchSelect: (branchId: string) => void;
}

export function BranchList({ data, onBranchSelect }: BranchListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((branch) => (
        <div 
          key={branch.id}
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-lg text-black">{branch.name}</h3>
              <p className="text-sm text-black mt-1">
                Total Penggunaan: {' '}
                <span className="font-medium text-black">
                  {branch.totalUsage.toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                  })}
                </span>
              </p>
            </div>
            <button
              onClick={() => onBranchSelect(branch.id)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg 
                        hover:from-orange-600 hover:to-red-600 transition-all duration-300"
            >
              Detail
            </button>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-black">Progress</span>
              <span className="font-medium text-black">
                {Math.round(branch.percentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full 
                            transition-all duration-300 ease-in-out"
                style={{ 
                  width: `${branch.percentage}%`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}