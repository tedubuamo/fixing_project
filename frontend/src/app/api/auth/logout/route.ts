import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Hapus cookie session
    const cookieStore = cookies()
    cookieStore.delete('session')
    
    // Clear all cookies untuk memastikan session benar-benar bersih
    const allCookies = cookieStore.getAll()
    allCookies.forEach(cookie => {
      cookieStore.delete(cookie.name)
    })

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { 
        status: 200,
        headers: {
          'Clear-Site-Data': '"cookies", "storage"'
        }
      }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 