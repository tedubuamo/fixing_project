import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clusterId = searchParams.get('clusterId')
    const userId = searchParams.get('userId')
    const poinId = searchParams.get('poinId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    console.log('Request params:', { clusterId, userId, poinId, month, year })

    const monthNumber = getMonthNumber(month || '')

    if (clusterId) {
      console.log('Fetching cluster user for:', clusterId)
      const clusterUserResponse = await fetch(
        `http://localhost:8000/api/admin/cluster-user/${clusterId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookies().toString()
          },
          credentials: 'include'
        }
      )

      if (!clusterUserResponse.ok) {
        const errorData = await clusterUserResponse.json()
        console.error('Cluster user error:', errorData)
        throw new Error(`Failed to get cluster user: ${errorData.error}`)
      }

      const clusterUser = await clusterUserResponse.json()
      console.log('Found cluster user:', clusterUser)

      // 2. Get reports using cluster user ID
      const response = await fetch(
        `http://localhost:8000/api/user-evidence/${clusterUser.id_user}/${poinId}/?month=${monthNumber}&year=${year}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookies().toString()
          },
          credentials: 'include'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Reports error:', errorData)
        throw new Error(`Failed to fetch reports: ${errorData.error}`)
      }

      const data = await response.json()
      console.log('Backend response:', data)
      
      // Kembalikan data lengkap, bukan hanya data_report
      // Ini akan menyertakan total_amount yang berisi percentage dan recommendation
      if (data.status === 'success') {
        // Transform data untuk AdminDetailModal
        const transformedReports = data.data_report?.map((report: any) => ({
          ...report,
          id_report: report.id || report.id_report,
          User: {
            username: clusterUser.username
          }
        })) || []
        
        return NextResponse.json({
          reports: transformedReports,
          total_amount: data.total_amount || [],
          data_recommendation: data.data_recommendation || [],
          status: 'success'
        })
      }
      
      return NextResponse.json(data)
    }

    // Jika request dari user biasa (ada userId)
    if (userId) {
      const response = await fetch(
        `http://localhost:8000/api/user-evidence/${userId}/${poinId}/?month=${monthNumber}&year=${year}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookies().toString()
          },
          credentials: 'include'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to fetch user reports: ${errorData.error}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    throw new Error('Missing required parameters')

  } catch (error) {
    console.error('Error in reports route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}

function getMonthNumber(month: string): number {
  const monthMap: { [key: string]: number } = {
    'Januari': 1,
    'Februari': 2,
    'Maret': 3,
    'April': 4,
    'Mei': 5,
    'Juni': 6,
    'Juli': 7,
    'Agustus': 8,
    'September': 9,
    'Oktober': 10,
    'November': 11,
    'Desember': 12
  }
  return monthMap[month] || 1
}