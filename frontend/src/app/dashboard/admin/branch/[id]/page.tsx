'use client'

import { Header } from '@/app/components/Header'
import { RegionClusterView } from '../../../components/RegionClusterView'

export default function BranchDashboard({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <RegionClusterView branchId={params.id} />
      </main>
    </div>
  )
} 