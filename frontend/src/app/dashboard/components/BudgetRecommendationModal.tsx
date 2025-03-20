'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'

interface BudgetRecommendationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BudgetRecommendationModal({ isOpen, onClose }: BudgetRecommendationModalProps) {
  const [recommendations, setRecommendations] = useState([
    { id: 'akuisisi', name: 'Akuisisi', percentage: 25, amount: 22995728 },
    { id: 'outlet', name: 'Outlet', percentage: 25, amount: 11497864 },
    // ... lainnya
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Submit rekomendasi budget
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Rekomendasikan Fee</h3>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">{rec.name}</span>
                  <div className="font-medium">Rp {rec.amount.toLocaleString()}</div>
                </div>
                <span className="text-sm">{rec.percentage}%</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="w-full mt-6 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
          >
            Submit RekomendasiFee
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 