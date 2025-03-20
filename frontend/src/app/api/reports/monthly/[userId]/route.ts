import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get reports grouped by month and poin
    const { data: reports, error } = await supabase
      .from('Report')
      .select(`
        amount_used,
        time,
        id_poin,
        Poin (
          id_poin,
          type
        )
      `)
      .eq('id_user', params.userId)
      .order('time', { ascending: true })

    if (error) throw error

    // Transform data to monthly format
    const monthlyData = reports.reduce((acc: any[], report) => {
      const date = new Date(report.time)
      const month = date.toLocaleString('id-ID', { month: 'long' })
      
      let monthData = acc.find(item => item.month === month)
      if (!monthData) {
        monthData = { month, poinData: {} }
        acc.push(monthData)
      }

      const poinId = report.id_poin
      monthData.poinData[poinId] = (monthData.poinData[poinId] || 0) + report.amount_used

      return acc
    }, [])

    return NextResponse.json(monthlyData)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monthly data' },
      { status: 500 }
    )
  }
} 