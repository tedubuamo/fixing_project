'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'react-hot-toast'

interface MarketingFeeInputProps {
  clusterId: string
  totalFee: number
  currentFee: number
  month: string
  year: string
  onUpdate?: () => void
}

export function MarketingFeeInput({ 
  clusterId, 
  totalFee, 
  currentFee,
  month,
  year,
  onUpdate 
}: MarketingFeeInputProps) {
  const { user } = useAuth()
  const [marketingFee, setMarketingFee] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localCurrentFee, setLocalCurrentFee] = useState(currentFee)

  useEffect(() => {
    setLocalCurrentFee(currentFee)
  }, [currentFee])

  // Hanya tampilkan untuk admin area
  if (user?.role !== 'admin_area') {
    return null
  }

  const formatNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMarketingFee(value.replace(/\./g, ''))
    e.target.value = formatNumber(value)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/marketing-fee/submit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          clusterId,
          amount: parseInt(marketingFee),
          month,
          year
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit marketing fee')
      }
      
      const data = await response.json()
      
      setLocalCurrentFee(parseInt(marketingFee))
      
      toast.success('Marketing fee berhasil disimpan')
      if (onUpdate) onUpdate()
      setMarketingFee('')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal menyimpan marketing fee')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
          <h3 className="text-lg text-gray-700 font-semibold">Marketing Fee</h3>
          <div className="text-right">
            <div className="text-sm sm:text-base text-gray-700">
              Total Fee: Rp {totalFee.toLocaleString('id-ID')}
            </div>
            <div className="text-sm sm:text-base text-gray-700">
              Current Marketing Fee: Rp {localCurrentFee.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            value={formatNumber(marketingFee)}
            onChange={handleChange}
            className="w-full sm:flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-700 text-sm sm:text-base"
            placeholder="Masukkan jumlah marketing fee..."
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !marketingFee}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#FF4B2B] to-[#FF7F50] text-white rounded-lg 
                     hover:opacity-90 transition-opacity disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
          >
            {isSubmitting ? 'Menyimpan...' : 'Submit Marketing Fee'}
          </button>
        </div>
      </div>
    </div>
  )
} 