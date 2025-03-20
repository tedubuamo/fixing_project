import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const {
      description,
      amount_used,
      image_url,
      id_user,
      id_poin,
      time
    } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase
      .from('Report')
      .insert([
        {
          description,
          amount_used,
          image_url,
          id_user,
          id_poin,
          time,
          status: false // default pending
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    )
  }
} 