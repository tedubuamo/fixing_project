import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const {
      username,
      email,
      password,
      nomor_telepon,
      area,
      region,
      branch,
      cluster
    } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })

    // Cek apakah cluster sudah memiliki user
    const { data: existingUsers, error: checkError } = await supabase
      .from('User')
      .select('id_user, username')
      .eq('id_cluster', cluster)

    // Handle error dari query
    if (checkError) {
      console.error('Error checking existing user:', checkError)
      return NextResponse.json(
        { error: 'Gagal memeriksa ketersediaan cluster' },
        { status: 500 }
      )
    }

    // Cek jika ada user yang sudah terdaftar di cluster tersebut
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { 
          error: `Cluster ini sudah digunakan oleh user: ${existingUsers[0].username}` 
        },
        { status: 400 }
      )
    }

    // Hash password sebelum disimpan
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Dapatkan max id_user
    const { data: maxIdData } = await supabase
      .from('User')
      .select('id_user')
      .order('id_user', { ascending: false })
      .limit(1)
      .single()

    const newUserId = (maxIdData?.id_user || 0) + 1

    // Insert user dengan password yang sudah di-hash
    const { data: userData, error: userError } = await supabase
      .from('User')
      .insert({
        id_user: newUserId,
        username,
        email,
        password: hashedPassword, // Gunakan password yang sudah di-hash
        telp: nomor_telepon,
        id_cluster: cluster,
        id_branch: branch,
        id_region: region,
        id_area: area,
        id_role: 6  // Role untuk user cluster
      })
      .select()
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Gagal membuat user: ' + userError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      username: userData.username
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
} 