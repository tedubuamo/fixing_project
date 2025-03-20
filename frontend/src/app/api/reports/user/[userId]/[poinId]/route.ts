import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Fungsi helper untuk konversi nama bulan ke angka
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
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
  
  return months[monthName] || 1
}

export async function GET(
  request: Request,
  { params }: { params: { userId: string, poinId: string } }
) {
  // Tambahkan console.log di awal fungsi
  console.log('=== ROUTE HANDLER CALLED ===')
  console.log('URL:', request.url)
  console.log('Params:', params)

  try {
    // 1. Ambil dan log parameter
    const { searchParams } = new URL(request.url)
    const monthName = searchParams.get('month')
    const year = searchParams.get('year')

    console.log('Route handler dipanggil dengan:', {
      userId: params.userId,
      poinId: params.poinId,
      month: monthName,
      year
    })

    // 2. Konversi bulan
    const monthNumber = monthName ? getMonthNumber(monthName) : 1

    // 3. Buat URL backend yang sederhana
    const backendUrl = `http://localhost:8000/api/user-evidence/${params.userId}/${params.poinId}/?month=${monthNumber}&year=${year}`
    
    console.log('Memanggil backend URL:', backendUrl)

    // 4. Panggil backend
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies().toString()
      }
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data.data_report || [])

  } catch (error) {
    console.error('Error di route handler:', error)
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 })
  }
}