'use client'

import { Dialog } from '@headlessui/react'
import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'react-hot-toast'

interface AdminDetailModalProps {
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

export function AdminDetailModal({
  isOpen,
  onClose,
  poinId,
  poinName,
  month,
  year,
  onDataUpdate,
  clusterId
}: AdminDetailModalProps) {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedPoin, setSelectedPoin] = useState({ 
    id: poinId,
    name: poinName
  })
  const [reportData, setReportData] = useState<any>(null)

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
      console.log('Reports data:', data)
      
      // Sekarang data berisi reports, total_amount, dll
      if (data.status === 'success') {
        setReports(data.reports || [])
        setReportData(data)
        
        // Proses data total_amount
        if (data.total_amount && data.total_amount.length > 0) {
          const poinData = data.total_amount.find(
            (item) => item.type.toUpperCase() === selectedPoin.name.toUpperCase()
          )
          
          console.log('Poin Data Found:', poinData)
          
          if (poinData) {
            console.log('Setting percentage to:', poinData.percentage)
            setSelectedPoin(prev => ({
              ...prev,
              percentage: poinData.percentage,
              rawAmount: poinData.total_amount,
              recommendation: poinData.recommend
            }))
            
            // Set total amount
            setTotalAmount(poinData.total_amount || 0)
          }
        }
      } else {
        setReports([])
        setTotalAmount(0)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Gagal memuat data laporan')
      toast.error('Gagal memuat data laporan')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEvidence = async () => {
    try {
      const isClusterAdmin = user?.role === 'admin_cluster_mcot' || user?.role === 'admin_cluster_gm'
      const endpoint = isClusterAdmin
        ? `/api/reports/user/${clusterId}/${poinId}?month=${month}&year=${year}`
        : `/api/reports/cluster-evidence?clusterId=${clusterId}&poinId=${poinId}&month=${month}&year=${year}`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Failed to fetch evidence')
      }

      const data = await response.json()
      setReports(data)
      
      const total = data.reduce(
        (sum: number, report: Report) => sum + (report.amount_used || 0), 
        0
      )
      setTotalAmount(total)
    } catch (error) {
      console.error('Error fetching evidence:', error)
      setError('Gagal memuat data evidence')
      toast.error('Gagal memuat data evidence')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchReports()
    }
  }, [isOpen, selectedPoin.id, month, year])

  useEffect(() => {
    if (reportData) {
      if (reportData.total_amount && reportData.total_amount.length > 0) {
        const poinData = reportData.total_amount.find(
          (item) => item.type === selectedPoin.name
        );
        
        if (poinData) {
          setSelectedPoin(prev => ({
            ...prev,
            percentage: poinData.percentage,
            rawAmount: poinData.total_amount,
            recommendation: poinData.recommend
          }));
        }
      }
    }
  }, [reportData, selectedPoin.name]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getReportsByPoin(
        clusterId,
        selectedPoin.id,
        month,
        year
      );
      
      if (response.status === 'success') {
        setReportData(response);
        
        if (response.total_amount && response.total_amount.length > 0) {
          const poinData = response.total_amount.find(
            (item) => item.type === selectedPoin.name
          );
          
          if (poinData) {
            setSelectedPoin(prev => ({
              ...prev,
              percentage: poinData.percentage,
              rawAmount: poinData.total_amount,
              recommendation: poinData.recommend
            }));
          }
        }
      } else {
        toast.error('Failed to load report data');
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-start justify-center p-4 sm:p-6">
        <Dialog.Panel className="mx-auto w-full max-w-3xl bg-white rounded-2xl shadow-lg my-8">
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="text-gray-600 hover:text-gray-800 flex items-center rounded-lg p-2 hover:bg-gray-100"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                      />
                    </svg>
                    <span className="ml-2">Kembali</span>
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 p-2 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="mb-6">
                  <select
                    value={selectedPoin.id}
                    onChange={handlePoinChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  >
                    {poinSektors.map((poin) => (
                      <option 
                        key={poin.id} 
                        value={poin.id}
                        className="text-gray-900"
                      >
                        {poin.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 p-3 sm:p-6 rounded-lg mb-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
                        <span className="text-sm">{selectedPoin?.name?.[0] || 'A'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="font-medium text-gray-700">{selectedPoin?.name}</span>
                          <span className="text-gray-500 ml-2">
                            {Math.round(selectedPoin?.percentage || 0)}%
                          </span>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min(selectedPoin?.percentage || 0, 100)}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>Rp {(selectedPoin?.rawAmount || 0).toLocaleString('id-ID')}</span>
                          <span>Rp {(selectedPoin?.recommendation || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabel responsive */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          #
                        </th>
                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pengeluaran
                        </th>
                        <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Evidence
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.length > 0 ? (
                        reports.map((report, index) => (
                          <tr 
                            key={report.id_report} 
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {report.User.username}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                              {report.description}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Rp {report.amount_used.toLocaleString()}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => window.open(report.image_url, '_blank')}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Lihat
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td 
                            colSpan={5} 
                            className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500"
                          >
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
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 