'use client'

interface BudgetComparisonProps {
  actualBudget: {
    amount: number
    description: string
  }[]
  recommendedBudget: {
    amount: number
    description: string
  }[]
}

export function BudgetComparison({ actualBudget, recommendedBudget }: BudgetComparisonProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Actual Budget */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Actual Budget</h2>
        <div className="space-y-4">
          {actualBudget.map((item, index) => (
            <div key={index} className="border-b pb-4">
              <div className="flex justify-between">
                <span className="font-medium">Rp {item.amount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Budget */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recommended Budget</h2>
        <div className="space-y-4">
          {recommendedBudget.map((item, index) => (
            <div key={index} className="border-b pb-4">
              <div className="flex justify-between">
                <span className="font-medium">Rp {item.amount.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 