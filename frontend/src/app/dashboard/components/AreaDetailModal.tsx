'use client'

import { Dialog } from '@headlessui/react'
import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'react-hot-toast'

interface AreaDetailModalProps {
  isOpen: boolean
  onClose: () => void
  poinId: string
  poinName: string
  month: string
  year: string
  onDataUpdate?: () => void
  clusterId: string
}

interface Report {
  id_report: number
  description: string
  amount_used: number
  time: string
  image_url: string
  status: boolean
  type: string
  User: {
    username: string
  }
}

export function AreaDetailModal({
  isOpen,
  onClose,
  poinId,
  poinName,
  month,
  year,
  onDataUpdate,
  clusterId
}: AreaDetailModalProps) {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState('')
  const [displayRecommendation, setDisplayRecommendation] = useState(0)
  const [selectedPoin, setSelectedPoin] = useState({ 
    id: poinId,
    name: poinName
  })

  // Daftar poin sektor
  const poinSektors = [
    { id: '1', name: 'Akuisisi' },
    { id: '2', name: 'Outlet' },
    { id: '3', name: 'SF' },
    { id: '4', name: 'CB Program' },
    { id: '5', name: 'Region (CVM & SO)' },
    { id: '6', name: 'Matpro' },
    { id: '7', name: 'Games' },
  ]

  // Update selectedPoin ketika props berubah
  useEffect(() => {
    setSelectedPoin({
      id: poinId,
      name: poinName
    })
  }, [poinId, poinName])

  // Handler untuk perubahan sektor
  const handlePoinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPoinId = event.target.value
    const newPoinName = poinSektors.find(p => p.id === newPoinId)?.name || ''
    
    setSelectedPoin({
      id: newPoinId,
      name: newPoinName
    })
  }

  useEffect(() => {
    if (isOpen) {
      fetchReports()
      fetchRecommendation()
    }
  }, [isOpen, selectedPoin.id, month, year])

  const fetchReports = async () => {
    if (!isOpen || !clusterId || !selectedPoin.id) return
    
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/reports?clusterId=${clusterId}&poinId=${selectedPoin.id}&month=${month}&year=${year}`,
        {
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }

      const data = await response.json()
      setReports(data)
      
      const total = data.reduce(
        (sum: number, report: Report) => sum + (report.amount_used || 0), 
        0
      )
      setTotalAmount(total)

    } catch (error) {
      console.error('Fetch error:', error)
      setError('Gagal memuat data laporan')
      toast.error('Gagal memuat data laporan')
    } finally {
      setIsLoading(false)
    }
  }

  // Tambahkan fungsi konversi bulan
  const getMonthNumber = (month: string): number => {
    const months: { [key: string]: number } = {
      'Januari': 1,
      'Februari': 2,
      'Maret': 3,
      'April': 4,
      'Mei': 5,
      'Juni': 6,
      'Juli': 7,
      'Agustus': 8,
      'September': 9,
      'Oktober': 10,
      'November': 11,
      'Desember': 12
    }
    return months[month] || new Date().getMonth() + 1
  }

  // Modifikasi fetchRecommendation
  const fetchRecommendation = async () => {
    if (!isOpen || !clusterId || !selectedPoin.id) return

    try {
      // Konversi bulan ke angka
      const monthNumber = getMonthNumber(month)
      
      const response = await fetch(
        `/api/reports/cluster-evidence?clusterId=${clusterId}&poinId=${selectedPoin.id}&month=${monthNumber}&year=${year}`,
        {
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch recommendation')
      }

      const data = await response.json()
      console.log('Recommendation response:', data)

      const recValue = data.total_amount?.[0]?.recommend ?? 0
      
      setRecommendation(recValue.toString())
      setDisplayRecommendation(recValue)

      console.log('Set recommendation value:', recValue)
    } catch (error) {
      console.error('Error fetching recommendation:', error)
      toast.error('Gagal memuat data rekomendasi')
    }
  }

  // Format number dengan titik setiap 1000
  const formatNumber = (value: string) => {
    // Hapus semua karakter non-digit
    const numbers = value.replace(/\D/g, '')
    // Format dengan titik
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleRecommendationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Hapus titik sebelum set ke state
    setRecommendation(value.replace(/\./g, ''))
    e.target.value = formatNumber(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/recommendations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cluster_id: clusterId,
          poin_id: poinId,
          recommend: parseFloat(recommendation),
          month,
          year
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to save recommendation')
      }

      // Update display recommendation setelah submit berhasil
      setDisplayRecommendation(parseFloat(recommendation))
      
      // Reset input dan refresh data
      setRecommendation('')
      await fetchRecommendation()  // Ambil data rekomendasi terbaru
      await fetchReports()         // Refresh data reports
      
      toast.success('Rekomendasi berhasil disimpan')
      
      if (onDataUpdate) {
        onDataUpdate()
      }

    } catch (error) {
      console.error('Error saving recommendation:', error)
      toast.error('Gagal menyimpan rekomendasi')
    }
  }

  // Add effect to handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 overflow-hidden">
        <div className="flex min-h-full items-center justify-center">
          <div className="w-full h-full p-4 flex items-center justify-center">
            <Dialog.Panel className="w-full max-w-4xl bg-white rounded-xl shadow-xl relative">
              <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b bg-white rounded-t-xl">
                <Dialog.Title className="text-base sm:text-lg text-gray-700 font-semibold">
                  Detail {selectedPoin.name}
                </Dialog.Title>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Pilih Poin
                    </label>
                    <select
                      value={selectedPoin.id}
                      onChange={handlePoinChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm sm:text-base"
                    >
                      {poinSektors.map((poin) => (
                        <option key={poin.id} value={poin.id}>
                          {poin.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-6 rounded-lg">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
                          <span className="text-sm">{selectedPoin.name?.[0] || 'A'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="font-medium text-gray-700">{selectedPoin.name}</span>
                            <span className="text-gray-500 ml-2">
                              {Math.round(((totalAmount || 0) / (displayRecommendation || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(
                                  ((totalAmount || 0) / (displayRecommendation || 1)) * 100, 
                                  100
                                )}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:w-64 space-y-2 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Total Penggunaan</span>
                          <span className="font-medium text-gray-900 tabular-nums">
                            Rp {totalAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Rekomendasi</span>
                          <span className="font-medium text-gray-900 tabular-nums">
                            Rp {displayRecommendation.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-sm sm:text-base text-gray-700 font-semibold">
                      Daftar Evidence
                    </h3>
                    <div className="overflow-x-auto rounded-lg border -mx-3 sm:mx-0">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">#</th>
                            <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengeluaran</th>
                            <th scope="col" className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Evidence</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reports.length > 0 ? (
                            reports.map((report, index) => (
                              <tr key={`${report.id_report}-${index}`} className="hover:bg-gray-50">
                                <td className="px-2 sm:px-6 py-2 sm:py-3 text-sm text-gray-500">{index + 1}</td>
                                <td className="px-2 sm:px-6 py-2 sm:py-3 text-sm text-gray-900">{report.User?.username}</td>
                                <td className="px-2 sm:px-6 py-2 sm:py-3 text-sm text-gray-900">{report.description}</td>
                                <td className="px-2 sm:px-6 py-2 sm:py-3 text-sm text-gray-900">
                                  Rp {report.amount_used.toLocaleString()}
                                </td>
                                <td className="px-2 sm:px-6 py-2 sm:py-3 text-sm">
                                  <button
                                    onClick={() => window.open(report.image_url, '_blank')}
                                    className="text-orange-600 hover:text-orange-900 font-medium"
                                  >
                                    Lihat
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr key="no-data">
                              <td colSpan={5} className="px-2 sm:px-6 py-2 sm:py-3 text-center text-sm text-gray-500">
                                Tidak ada data untuk ditampilkan
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t bg-white rounded-b-xl">
                <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-base text-gray-700 font-semibold">
                    Set Recommendation
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
                    <div className="flex-1 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Recommendation Amount
                      </label>
                      <input
                        type="text"
                        value={formatNumber(recommendation)}
                        onChange={handleRecommendationChange}
                        className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                        placeholder="Enter amount..."
                      />
                    </div>
                    <button
                      onClick={handleSubmit}
                      className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base font-medium"
                    >
                      Save Recommendation
                    </button>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </div>
    </Dialog>
  )
} 