'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { api } from '@/services/api'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ReportItem {
  id: number
  description: string
  amount_used: number
  image_url: string
  time: string
  user_id: string
}

interface Report {
  id_report: number
  description: string
  amount_used: number
  time: string
  image_url: string
  status: boolean
  type: string
}

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  poinId: string
  poinName: string
  month: string
  year: string
  onDataUpdate: () => void
  isAdmin?: boolean
}

interface FilePreview {
  name: string;
  url: string;
}

interface FormData {
  evidence: FileList
  description: string
  amount: string
}

export function DetailModal({
  isOpen,
  onClose,
  poinId,
  poinName,
  month,
  year,
  onDataUpdate,
  isAdmin = false
}: DetailModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPoin, setSelectedPoin] = useState({ 
    id: poinId,
    name: poinName
  })
  const { 
    register, 
    handleSubmit,
    reset,
    getValues,
    formState: { errors } 
  } = useForm()
  const [amount, setAmount] = useState('')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [recommendationData, setRecommendationData] = useState<{
    recommend: number;
    percentage: number;
  }>({ recommend: 0, percentage: 0 })
  const supabase = createClientComponentClient()

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

  // Perbaiki handler untuk perubahan sektor
  const handlePoinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPoinId = event.target.value
    const newPoinName = poinSektors.find(p => p.id === newPoinId)?.name || ''
    
    // Update selectedPoin state
    setSelectedPoin({
      id: newPoinId,
      name: newPoinName
    })
    
    // Panggil fetchEvidenceWithRecommendation secara langsung
    fetchEvidenceWithRecommendation(newPoinId);
  }

  // Fungsi untuk fetch reports dari backend
  const fetchReports = async () => {
    if (!isOpen || !user?.id) return
    
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(
        `/api/reports?userId=${user.id}&poinId=${selectedPoin.id}&month=${month}&year=${year}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`)
      }

      const data = await response.json()
      console.log('Received data:', data)

      if ('error' in data) {
        throw new Error(data.error)
      }

      setReports(Array.isArray(data) ? data : [])
      const total = (Array.isArray(data) ? data : []).reduce(
        (sum, report) => sum + (report.amount_used || 0),
        0
      )
      setTotalAmount(total)

    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load reports')
      toast.error('Gagal memuat data laporan')
    } finally {
      setIsLoading(false)
    }
  }

  // Pastikan fetch dipanggil saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchReports()
    }
  }, [isOpen, selectedPoin.id, month, year])

  // Modifikasi fungsi fetchEvidenceWithRecommendation untuk menerima poinId sebagai parameter
  const fetchEvidenceWithRecommendation = async (poinIdParam?: string) => {
    if (!isOpen || !user?.id) return
    
    // Gunakan poinId yang diberikan sebagai parameter atau gunakan selectedPoin.id
    const currentPoinId = poinIdParam || selectedPoin.id
    
    try {
      setIsLoading(true)
      setError(null)

      // Gunakan endpoint baru yang menyediakan data recommendation
      const response = await fetch(
        `/api/reports/user-evidence?userId=${user.id}&poinId=${currentPoinId}&month=${month}&year=${year}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch evidence')
      }

      const data = await response.json()
      
      if ('error' in data) {
        throw new Error(data.error)
      }

      // Set reports dari data_report
      setReports(Array.isArray(data.data_report) ? data.data_report : [])
      
      // Set total amount dan recommendation dari total_amount
      if (data.total_amount && data.total_amount.length > 0) {
        const totalData = data.total_amount[0];
        setTotalAmount(totalData.total_amount || 0);
        
        // Set recommendation data
        setRecommendationData({
          recommend: totalData.recommend || 0,
          percentage: totalData.percentage || 0
        });
      } else {
        // Reset data jika tidak ada data
        setTotalAmount(0);
        setRecommendationData({
          recommend: 0,
          percentage: 0
        });
      }

    } catch (error) {
      console.error('Error:', error)
      setError('Gagal memuat data evidence')
      toast.error('Gagal memuat data evidence')
    } finally {
      setIsLoading(false)
    }
  }

  // Modifikasi useEffect untuk memanggil fetchEvidenceWithRecommendation
  useEffect(() => {
    if (isOpen) {
      fetchEvidenceWithRecommendation();
    }
  }, [isOpen, month, year]); // Hapus selectedPoin.id dari dependencies

  // Handler untuk membuka modal konfirmasi
  const openDeleteConfirmation = (reportId: number) => {
    console.log('Opening delete confirmation for report:', reportId)
    setReportToDelete(reportId)
    setIsDeleteModalOpen(true)
  }

  // Handler untuk delete evidence
  const handleDeleteClick = async (reportId: number) => {
    try {
      console.log('Starting delete process for report:', reportId)
      setIsLoading(true)

      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('Delete API response:', data)

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete report: ${response.status}`)
      }

      setIsDeleteModalOpen(false)
      await fetchReports()
      onDataUpdate?.()
      toast.success('Evidence berhasil dihapus')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Gagal menghapus evidence')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.includes('image/')) {
        alert('Please upload an image file')
        return
      }
      
      const preview = URL.createObjectURL(file)
      setFilePreview(preview)
    }
  }

  // Clear preview when form is reset
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview)
      }
    }
  }, [filePreview])

  // Perbaiki fungsi handleAmountChange untuk menangani format rupiah
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus semua karakter non-digit
    const value = e.target.value.replace(/\D/g, '')
    
    // Format angka dengan pemisah ribuan
    const formattedValue = value === '' ? '' : parseInt(value).toLocaleString('id-ID')
    
    setAmount(formattedValue)
  }

  // Tambahkan validasi file
  const validateFile = (file: File) => {
    const MAX_SIZE = 1024 * 1024; // 1MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Format file tidak didukung');
    }
    if (file.size > MAX_SIZE) {
      throw new Error('Ukuran file terlalu besar (max 1MB)');
    }
    return true;
  };

  return (
    <>
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
                          <span className="text-sm">{selectedPoin.name?.[0] || 'A'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="font-medium text-gray-700">{selectedPoin.name}</span>
                            <span className="text-gray-500 ml-2">
                              {Math.round(recommendationData.percentage)}%
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${Math.min(recommendationData.percentage, 100)}%` 
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
                            Rp {recommendationData.recommend.toLocaleString('id-ID')}
                          </span>
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
                            Deskripsi
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pengeluaran
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Evidence
                          </th>
                          <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reports.length > 0 ? (
                          reports.map((report, index) => (
                            <tr 
                              key={report.id_report ? `report-${report.id_report}` : `report-index-${index}`} 
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {index + 1}
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
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() => openDeleteConfirmation(report.id_report)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr key="no-data">
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

                  {/* Form responsive */}
                  <form onSubmit={handleSubmit(async (data) => {
                    try {
                      setIsSubmitting(true)
                      
                      // Validasi file wajib
                      if (!data.image?.[0]) {
                        setError('Evidence wajib dilampirkan')
                        toast.error('Evidence wajib dilampirkan')
                        return
                      }
                      
                      let imageUrl = ''
                      
                      // Upload image (karena sudah wajib, tidak perlu if condition)
                      setIsUploading(true)
                      const file = data.image[0]
                      const fileExt = file.name.split('.').pop()
                      const fileName = `${Math.random()}.${fileExt}`
                      const filePath = `${user?.id}/${fileName}`

                      // Upload ke Supabase Storage
                      const { error: uploadError, data: uploadData } = await supabase
                        .storage
                        .from('images')
                        .upload(filePath, file)

                      if (uploadError) throw uploadError

                      // Dapatkan public URL
                      const { data: { publicUrl } } = supabase
                        .storage
                        .from('images')
                        .getPublicUrl(filePath)

                      imageUrl = publicUrl
                      setIsUploading(false)

                      // Perbaiki format amount sebelum dikirim ke API
                      const cleanAmount = amount.replace(/\D/g, '')
                      
                      // Submit report dengan image URL
                      const response = await fetch('/api/reports/create', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          description: data.description,
                          amount_used: parseInt(cleanAmount),
                          image_url: imageUrl,
                          id_user: user?.id,
                          id_poin: selectedPoin.id,
                          time: new Date().toISOString()
                        }),
                      })

                      if (!response.ok) {
                        throw new Error('Failed to submit report')
                      }

                      reset()
                      onDataUpdate?.()
                      toast.success('Evidence berhasil ditambahkan')
                      onClose()
                      
                    } catch (error) {
                      console.error('Submit error:', error)
                      toast.error('Gagal menambahkan evidence')
                    } finally {
                      setIsSubmitting(false)
                    }
                  })} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="mt-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            Rp
                          </span>
                          <input
                            {...register('amount', { required: true })}
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <textarea
                        {...register('description', { required: true })}
                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-700 focus:border-gray-700 focus:ring-0 text-gray-500 placeholder-gray-400"
                        placeholder="Masukkan penjelasan acara"
                        rows={3}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Evidence <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          {...register('image', { required: 'Evidence wajib dilampirkan' })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          accept="image/*"
                        />
                        {error && (
                          <p className="mt-1 text-sm text-red-500">
                            {error}
                          </p>
                        )}
                      </div>

                      {/* Error messages */}
                      {errors.amount && (
                        <p className="text-red-500 text-sm">Pengeluaran harus diisi</p>
                      )}
                      {errors.description && (
                        <p className="text-red-500 text-sm">Deskripsi harus diisi</p>
                      )}
                      {errors.image && (
                        <p className="text-red-500 text-sm">Bukti harus diupload</p>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                      >
                        {isSubmitting || isUploading ? 'Mengirim...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal konfirmasi delete */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={() => !isLoading && setIsDeleteModalOpen(false)} // Prevent close while loading
        className="relative z-[60]"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm bg-white rounded-2xl shadow-lg p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Konfirmasi Hapus
            </Dialog.Title>
            
            <p className="text-gray-500 mb-6">
              Apakah Anda yakin ingin menghapus evidence ini?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => reportToDelete && handleDeleteClick(reportToDelete)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {isLoading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
} 