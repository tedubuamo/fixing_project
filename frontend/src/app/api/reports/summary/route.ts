import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const clusterId = searchParams.get('clusterId')

    const supabase = createRouteHandlerClient({ cookies })

    let query = supabase
      .from('Report')
      .select(`
        *,
        User!inner (
          username,
          id_cluster
        ),
        Poin (
          poin
        )
      `)

    // Filter berdasarkan role
    if (clusterId) {
      // Untuk admin, lihat reports dari cluster tertentu
      query = query.eq('User.id_cluster', clusterId)
    } else if (userId) {
      // Untuk user, lihat reports mereka sendiri
      query = query.eq('id_user', userId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
} 