import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Cek cookie session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')
    
    // Debug log
    console.log('Session cookie:', sessionCookie?.value)

    if (!sessionCookie?.value) {
      console.log('No session cookie found')
      return NextResponse.json({ user: null })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const session = JSON.parse(sessionCookie.value)

    // Fetch user data dengan cluster info
    const { data: userData, error } = await supabase
      .from('User')
      .select(`
        id_user,
        username,
        email,
        id_cluster,
        id_branch,
        id_region,
        Role (role)
      `)
      .eq('id_user', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user data:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      cookieStore.delete('session')
      return NextResponse.json({ user: null })
    }

    // Set cookie baru untuk refresh session
    cookieStore.set('session', JSON.stringify({
      user: {
        id: userData.id_user,
        username: userData.username,
        email: userData.email,
        role: userData.Role?.role || 'user',
        cluster: userData.id_cluster,
        branch: userData.id_branch,
        region: userData.id_region
      }
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({
      user: {
        id: userData.id_user,
        username: userData.username,
        email: userData.email,
        role: userData.Role?.role || 'user',
        cluster: userData.id_cluster,
        branch: userData.id_branch,
        region: userData.id_region
      }
    })

  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null })
  }
} 