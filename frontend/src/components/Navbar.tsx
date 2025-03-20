'use client'

import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard/user" className="text-xl font-bold text-gray-800">
                BudgetFlow
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <div className="ml-3 relative group">
              <div className="flex items-center">
                <button
                  type="button"
                  className="flex text-sm rounded-full focus:outline-none"
                  id="user-menu"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                <div className="ml-2">
                  <div className="text-sm font-medium text-gray-700">{user?.username}</div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
              </div>

              {/* Dropdown menu */}
              <div className="hidden group-hover:block absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 