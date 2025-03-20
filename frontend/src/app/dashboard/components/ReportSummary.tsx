'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

interface Report {
  id_report: number
  description: string
  amount_used: number
  status: boolean
  time: string
  User: {
    username: string
  }
  Poin: {
    poin: string
  }
}

export function ReportSummary() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const params = user?.role === 'user_cluster' 
          ? `userId=${user.id}`
          : `clusterId=${user.cluster}`

        const response = await fetch(`/api/reports/summary?${params}`)
        const data = await response.json()
        setReports(data)
      } catch (error) {
        console.error('Error fetching reports:', error)
      }
    }

    if (user) {
      fetchReports()
    }
  }, [user])

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Report Summary</h2>
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id_report} className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{report.Poin.poin}</p>
                <p className="text-sm text-gray-600">{report.description}</p>
                <p className="text-sm text-gray-500">{report.User.username}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Rp {report.amount_used.toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  report.status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 