import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const reportId = params.reportId
    const backendUrl = `http://localhost:8000/api/report/delete/${reportId}/`
    
    console.log('API Route - Starting delete request to:', backendUrl)

    const cookieHeader = cookies().toString()
    console.log('Cookie being sent:', cookieHeader)

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader
      }
    })

    console.log('Backend response status:', response.status)

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Backend error response:', errorData)
      throw new Error(`Backend returned ${response.status}: ${errorData}`)
    }

    return NextResponse.json({ message: 'Report deleted successfully' })

  } catch (error) {
    console.error('API Route - Delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete report' },
      { status: 500 }
    )
  }
} 