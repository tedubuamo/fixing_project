'use client'

import { useAuth } from '@/providers/AuthProvider'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      setShowDropdown(false)
      
      // Double check untuk memastikan redirect
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      alert('Failed to logout. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <motion.header 
      className="bg-gradient-to-r from-[#FF4B2B] to-[#FF9F1C] px-4 py-2"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <Image 
            src="/telkomsel.svg" 
            alt="Telkomsel Logo" 
            width={40} 
            height={40}
            className="h-8 w-auto"
          />
        </motion.div>

        {/* User Menu */}
        <div className="relative">
          <motion.button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium hidden sm:block">
              {user?.username}
            </span>
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  )
} 