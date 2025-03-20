import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    console.log('Login attempt:', { username })

    const { data: userData, error: userError } = await supabase
      .from('User')
      .select(`
        id_user,
        username,
        password,
        email,
        telp,
        id_cluster,
        id_branch,
        id_region
      `)
      .eq('username', username)
      .single()

    console.log('Query result:', { userData, userError })

    if (userError || !userData) {
      return new NextResponse(
        JSON.stringify({ error: 'Username tidak ditemukan' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Verifikasi password
    let isValidPassword = false

    // Cek plain text password dulu (temporary)
    if (userData.password === password) {
      isValidPassword = true
    } else {
      // Fallback ke bcrypt untuk password yang sudah di-hash
      isValidPassword = await bcrypt.compare(password, userData.password)
    }

    if (!isValidPassword) {
      return new NextResponse(
        JSON.stringify({ error: 'Password salah' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Helper function untuk menentukan role berdasarkan id_user
    const getRoleFromId = (id: number) => {
      const prefix = Math.floor(id / 1000) * 1000
      switch (prefix) {
        case 1000:
          return 'admin_area'
        case 2000:
          return 'admin_region'
        case 3000:
          return 'admin_branch'
        case 4000:
          return 'admin_cluster_mcot'
        case 5000:
          return 'admin_cluster_gm'
        case 6000:
          return 'user_cluster'
        default:
          return 'user'
      }
    }

    // Set session dengan data lengkap
    const session = {
      user: {
        id: userData.id_user,
        username: userData.username,
        email: userData.email,
        role: getRoleFromId(userData.id_user),
        cluster: userData.id_cluster,
        branch: userData.id_branch,
        region: userData.id_region
      },
      expiresAt: new Date(Date.now() + 1000 * 60 * 2).toISOString(), // 2 menit
      createdAt: new Date().toISOString()
    }

    // Set cookie dengan expiry yang sama (2 menit)
    cookies().set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 2 // 2 menit dalam detik
    })

    console.log('Login successful:', session)

    return new NextResponse(
      JSON.stringify(session),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 