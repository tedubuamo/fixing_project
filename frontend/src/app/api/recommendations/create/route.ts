import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Frontend route handler received:', data)

    const response = await fetch('http://127.0.0.1:8000/api/recommendations/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cluster_id: data.cluster_id,
        poin_id: data.poin_id,
        recommend: data.recommend,
        month: data.month,
        year: data.year
      }),
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create recommendation')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Error in create recommendation route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
} 