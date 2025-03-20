'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'react-hot-toast'
import { Header } from '@/app/components/Header'

export default function BranchClusterRedirect({ params }: { params: { clusterId: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const branchId = searchParams?.get('branchId')

  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      try {
        if (!branchId) {
          throw new Error('Branch ID is required')
        }

        // Gunakan endpoint branch untuk check access
        const accessResponse = await fetch(
          `/api/admin/branch/${branchId}/clusters/check-access/${params.clusterId}/`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )

        const accessData = await accessResponse.json()

        if (accessData.hasAccess) {
          router.push(`/dashboard/admin/cluster/${params.clusterId}?branchId=${branchId}`)
        } else {
          throw new Error('Access denied')
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to access cluster')
        router.push('/dashboard/error')
      }
    }

    if (user) {
      checkAccessAndRedirect()
    } else {
      router.push('/auth/login')
    }
  }, [params.clusterId, branchId, user, router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa akses ke cluster...</p>
        </div>
      </main>
    </div>
  )
} 