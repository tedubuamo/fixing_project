'use client'

import { Header } from '@/app/components/Header'
import { BranchClusterView } from '../../../components/BranchClusterView'
import { useAuth } from '@/providers/AuthProvider'

export default function ClusterPage({ params }: { params: { clusterId: string } }) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <BranchClusterView 
          clusterId={params.clusterId}
        />
      </main>
    </div>
  )
}