import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const poinId = searchParams.get('poinId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    // Konversi nama bulan ke angka
    const monthNumber = getMonthNumber(month || '')

    // Gunakan endpoint yang menyediakan data recommendation
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/user-evidence/${userId}/${poinId}/?month=${monthNumber}&year=${year}`

    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies().toString()
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch evidence')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    )
  }
}

function getMonthNumber(month: string): string {
  const monthMap: { [key: string]: string } = {
    'Januari': '1',
    'Februari': '2',
    'Maret': '3',
    'April': '4',
    'Mei': '5',
    'Juni': '6',
    'Juli': '7',
    'Agustus': '8',
    'September': '9',
    'Oktober': '10',
    'November': '11',
    'Desember': '12'
  }
  return monthMap[month] || '1'
} 