import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { clusterId: string; poinId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/${params.clusterId}/${params.poinId}?month=${month}&year=${year}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch recommendation')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching recommendation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendation' },
      { status: 500 }
    )
  }
} 