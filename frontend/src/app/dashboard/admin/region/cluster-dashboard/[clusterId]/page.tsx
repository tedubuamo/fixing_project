'use client'

import { Header } from '@/app/components/Header'
import { RegionClusterDashboardView } from '../../../../components/RegionClusterDashboardView'

export default function RegionClusterDashboardPage({ params }: { params: { clusterId: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <RegionClusterDashboardView clusterId={params.clusterId} />
      </main>
    </div>
  )
} 