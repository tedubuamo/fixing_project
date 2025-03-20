import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Fungsi untuk parse cookie session
const parseSession = (session: string | undefined) => {
  if (!session) return null
  try {
    const sessionData = JSON.parse(decodeURIComponent(session))
    const expiryTime = new Date(sessionData.expiresAt).getTime()
    
    // Jika session expired, return null
    if (Date.now() > expiryTime) {
      console.log('Session expired')
      return null
    }
    
    return sessionData
  } catch {
    return null
  }
}

// Fungsi untuk validasi token
const validateToken = (token: string | undefined) => {
  if (!token) return false
  try {
    // Parse JWT token
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expiryTime = payload.exp * 1000 // Convert to milliseconds
    return Date.now() < expiryTime
  } catch {
    return false
  }
}

// Helper functions untuk validasi role
function isAreaAdmin(user: any) {
  return user.role === 'admin_area'
}

function isRegionAdmin(user: any) {
  return user.role === 'admin_region'
}

function isBranchAdmin(user: any) {
  return user.role === 'admin_branch'
}

function isClusterAdmin(user: any) {
  return user.role === 'admin_cluster_mcot' || user.role === 'admin_cluster_gm'
}

// Update middleware untuk proteksi route berdasarkan role
export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  let sessionData = parseSession(session)
  const path = request.nextUrl.pathname

  // Bypass untuk static files dan API routes
  if (
    path.startsWith('/_next/') || 
    path.startsWith('/api/') ||
    path.startsWith('/static/') ||
    path.includes('favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Proteksi route cluster detail
  if (path.startsWith('/dashboard/admin/cluster/')) {
    const user = sessionData?.user
    const clusterId = path.split('/').pop()

    // Jika admin_branch, cek akses ke cluster
    if (user?.role === 'admin_branch') {
      try {
        const response = await fetch(
          `http://localhost:8000/api/admin/branch/${user.branch}/clusters/check-access/${clusterId}/`,
          {
            headers: {
              'Cookie': request.headers.get('cookie') || '',
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) {
          return NextResponse.redirect(new URL('/dashboard/error', request.url))
        }

        const data = await response.json()
        
        if (!data.hasAccess) {
          return NextResponse.redirect(new URL('/dashboard/error', request.url))
        }
      } catch (error) {
        console.error('Error checking cluster access:', error)
        return NextResponse.redirect(new URL('/dashboard/error', request.url))
      }
    } else if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin/cluster', request.url))
    }
  }

  console.log('Middleware check:', {
    path,
    hasToken: !!request.cookies.get('auth_token')?.value,
    hasSession: !!session
  })

  // Auth routes protection
  const isAuthRoute = path.startsWith('/auth')
  const isDashboardRoute = path.startsWith('/dashboard')
  const isAuthenticated = !!sessionData?.user

  console.log('Route Protection:', {
    path,
    isAuthRoute,
    isDashboardRoute,
    isAuthenticated,
    sessionData: sessionData?.user
  })

  // Jika user sudah login mencoba akses halaman auth
  if (isAuthRoute && isAuthenticated) {
    console.log('Redirecting authenticated user to dashboard')
    return NextResponse.redirect(new URL('/dashboard/user', request.url))
  }

  // Jika user belum login mencoba akses dashboard
  if (isDashboardRoute && !isAuthenticated) {
    console.log('Redirecting unauthenticated user to login')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

// Helper function untuk validasi akses ke ID
function validateAccessToId(user: any, pathId: string) {
  switch (user.role) {
    case 'admin_region':
      return user.region === parseInt(pathId)
    case 'admin_branch':
      return user.branch === parseInt(pathId)
    case 'admin_cluster_mcot':
    case 'admin_cluster_gm':
      return user.cluster === parseInt(pathId)
    case 'admin_area':
      return true // Admin area bisa akses semua
    default:
      return false
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /static/ (static files)
     * 4. .*\..*$ (files with extensions - images, etc)
     */
    '/((?!api|_next|static|.*\\..*$).*)',
    '/dashboard/:path*',
    '/auth/:path*'
  ]
}