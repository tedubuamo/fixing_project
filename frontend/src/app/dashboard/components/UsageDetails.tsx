'use client'

import { useState, useEffect, useMemo } from 'react'
import { DetailModal } from './DetailModal'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/providers/AuthProvider'
import { AdminDashboard } from './AdminDashboard'
import { api } from '@/services/api'
import { AdminDetailModal } from './AdminDetailModal'
import { AreaDetailModal } from './AreaDetailModal'
import { PoinType } from '@/types'

// Tambahkan interface untuk MonthYearSelector
interface MonthYearSelectorProps {
  selectedMonth: string
  selectedYear: string
  onMonthChange: (month: string) => void
  onYearChange: (year: string) => void
}

// Komponen MonthYearSelector
function MonthYearSelector({ selectedMonth, selectedYear, onMonthChange, onYearChange }: MonthYearSelectorProps) {
  // Generate tahun dari 2024-2030
  const years = Array.from({ length: 7 }, (_, i) => (2024 + i).toString())

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      {/* Month Selector */}
      <div className="relative flex-1 sm:flex-none sm:w-40">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="w-full p-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 appearance-none"
        >
          {months.map((month) => (
            <option key={month} value={month} className="text-gray-900">
              {month}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>

      {/* Year Selector */}
      <div className="relative flex-1 sm:flex-none sm:w-32">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="w-full p-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 appearance-none"
        >
          {years.map((year) => (
            <option key={year} value={year} className="text-gray-900">
              {year}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

interface UsageItem {
  id: string
  name: string
  amount: string
  percentage: number
  color: string
}

interface UsageDetailsProps {
  data: Array<{
    id: string
    name: string
    amount: string
    percentage: number
    recommendation?: number
    color?: string
  }>
  selectedMonth: string
  selectedYear: string
  onMonthChange: (month: string) => void
  onYearChange: (year: string) => void
  onDetailClick?: (poinId: string, name: string) => void
  poinTypes: PoinType[]
  selectedCluster?: string
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const years = ['2024', '2025', '2026'] // Bisa disesuaikan

// Definisikan semua sektor sesuai tabel Poin
const ALL_SECTORS = [
  { id: 1, name: 'AKUISISI' },
  { id: 2, name: 'OUTLET' },
  { id: 3, name: 'SF' },
  { id: 4, name: 'CB PROGRAM' },
  { id: 5, name: 'REGION (CVM & SO)' },
  { id: 6, name: 'MATPRO' },
  { id: 7, name: 'GAMES' }
]

// Tambahkan fungsi untuk mendapatkan id numerik dari nama poin
const getPoinId = (poinName: string): string => {
  const poinMap: Record<string, string> = {
    'AKUISISI': '1',
    'OUTLET': '2',
    'SF': '3',
    'CB PROGRAM': '4',
    'REGION (CVM & SO)': '5',
    'MATPRO': '6',
    'GAMES': '7'
  }
  return poinMap[poinName] || '1'
}

export function UsageDetails({
  data,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onDetailClick,
  poinTypes,
  selectedCluster
}: UsageDetailsProps) {
  const { user } = useAuth()
  const [selectedPoin, setSelectedPoin] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Modifikasi logic untuk menentukan modal yang digunakan
  const getModalType = () => {
    if (user?.role === 'admin_area') {
      return 'area'
    } else if (user?.role === 'admin_branch' || user?.role === 'admin_region') {
      return !!selectedCluster ? 'admin' : null
    } else if (user?.role === 'admin_cluster_mcot' || user?.role === 'admin_cluster_gm') {
      return 'admin'
    }
    return 'user'
  }

  // Ubah fungsi calculatePercentage untuk menggunakan recommendation dari backend
  const calculatePercentage = (item: any): number => {
    if (!item.recommendation || item.recommendation === 0) return 0
    
    // Ekstrak nilai numerik dari string amount (misalnya "Rp 1.000.000" -> 1000000)
    const amountStr = item.amount.replace(/[^\d]/g, '')
    const amount = parseInt(amountStr, 10) || 0
    
    // Hitung persentase berdasarkan recommendation
    return Math.min((amount / item.recommendation) * 100, 100)
  }

  // Dalam useMemo untuk processedItems, pastikan percentage dihitung dengan benar
  const processedItems = useMemo(() => {
    // Buat map untuk menyimpan data yang ada
    const dataMap = new Map(
      data.map(item => [item.name, item])
    )

    // Proses semua sektor, baik yang ada data maupun yang belum
    return ALL_SECTORS.map(sector => {
      const existingData = dataMap.get(sector.name)
      
      if (existingData) {
        return {
          id: sector.id.toString(),
          name: sector.name,
          amount: existingData.amount,
          percentage: calculatePercentage(existingData),
          recommendation: existingData.recommendation,
          color: getRandomColor(sector.id - 1)
        }
      }

      // Jika tidak ada data, tampilkan default values
      return {
        id: sector.id.toString(),
        name: sector.name,
        amount: 'Rp 0',
        percentage: 0,
        recommendation: 0,
        color: getRandomColor(sector.id - 1)
      }
    })
  }, [data])

  // Hitung total menggunakan useMemo juga
  const totalAmount = useMemo(() => {
    return processedItems.reduce((sum, item) => {
      const amount = parseFloat(item.amount.replace(/[Rp\s,.]/g, '')) || 0
      return sum + amount
    }, 0)
  }, [processedItems])

  // Tambahkan console log untuk debug
  console.log('UsageDetails props:', {
    data,
    selectedMonth,
    selectedYear,
    userRole: user?.role
  })
  console.log('Processed Items:', processedItems)

  const handleItemClick = (item: UsageItem) => {
    console.log('Selected item:', item) // Tambahkan log untuk debug
    setSelectedPoin(item)
    setIsModalOpen(true)
  }

  // Hindari setState di dalam render
  const handleMonthChange = (month: string) => {
    if (onMonthChange) {
      onMonthChange(month)
    }
  }

  const handleYearChange = (year: string) => {
    if (onYearChange) {
      onYearChange(year)
    }
  }

  const handlePoinClick = (poin: UsageItem) => {
    setSelectedPoin(poin)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700">Rincian Penggunaan</h2>
        <MonthYearSelector 
          selectedMonth={selectedMonth || ''}
          selectedYear={selectedYear || ''}
          onMonthChange={handleMonthChange}
          onYearChange={handleYearChange}
        />
      </div>

      {user?.role === 'admin_cluster' ? (
        <AdminDashboard 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
        />
      ) : (
        <div className="space-y-4">
          {processedItems.length > 0 ? (
            processedItems.map((item) => (
              <div
                key={item.id}
                className="space-y-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => {
                  handleItemClick(item)
                  onDetailClick?.(item.id, item.name)
                }}
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-600">{item.amount}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(Math.max(item.percentage, 0), 100)}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">
                    {Math.round(item.percentage)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">
              Tidak ada data untuk ditampilkan
            </div>
          )}

          {/* Total section */}
          <div className="mt-8 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="font-semibold text-gray-900">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedPoin && (
        (() => {
          const modalType = getModalType()
          
          switch (modalType) {
            case 'area':
              return (
                <AreaDetailModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  poinId={selectedPoin.id}
                  poinName={selectedPoin.name}
                  month={selectedMonth}
                  year={selectedYear}
                  onDataUpdate={() => {}}
                  clusterId={selectedCluster || ''}
                />
              )
            case 'admin':
              return (
                <AdminDetailModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  poinId={selectedPoin.id}
                  poinName={selectedPoin.name}
                  month={selectedMonth}
                  year={selectedYear}
                  onDataUpdate={() => {}}
                  clusterId={selectedCluster || user?.cluster?.toString() || ''}
                />
              )
            default:
              return (
                <DetailModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  poinId={selectedPoin.id}
                  poinName={selectedPoin.name}
                  month={selectedMonth}
                  year={selectedYear}
                  onDataUpdate={() => {}}
                />
              )
          }
        })()
      )}
    </div>
  )
}

// Fungsi helper untuk warna random
function getRandomColor(index: number) {
  const colors = ['#FF4B2B', '#FF9F1C', '#00C49F', '#0088FE', '#FFBB28']
  return colors[index % colors.length]
} 