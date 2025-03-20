'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/providers/AuthProvider'
import Image from 'next/image'
import { api } from '@/services/api'
import { toast } from 'react-hot-toast'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { login: authLogin, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // 1. Login ke API
      const response = await api.login({
        username: username,
        password: password
      })

      console.log('API Response:', response)

      // 2. Pastikan format data sesuai
      if (response.status === 'Success' && response.token && response.user) {
        // 3. Kirim ke AuthProvider
        await login({
          token: response.token,
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role,
          cluster: response.user.cluster,
          branch: response.user.branch,
          region: response.user.region,
          area: response.user.area
        })
      } else {
        setError('Format response tidak valid')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Login gagal')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="min-h-screen bg-white relative flex items-center justify-center p-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Gradient Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white" />
        
        {/* Background blobs */}
        <motion.div
          className="absolute -top-20 -right-20 w-60 h-60 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -45, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="w-full max-w-sm relative z-10 py-6"
        >
          {/* Logo */}
          <motion.div 
            variants={fadeIn}
            className="flex justify-center mb-6"
          >
            <Image 
              src="/telkomsel.svg" 
              alt="Telkomsel Logo" 
              width={80}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </motion.div>

          {/* Card Login */}
          <motion.div
            variants={fadeIn}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-5 mx-4 sm:mx-0"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center mb-4"
            >
              <h1 className="text-xl font-semibold gradient-text">
                Login to Account
              </h1>
            </motion.div>

            <motion.form 
              variants={staggerContainer}
              onSubmit={handleSubmit} 
              className="space-y-3"
            >
              <motion.div variants={fadeIn}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm"
                  placeholder="Username"
                  required
                  disabled={isLoading}
                />
              </motion.div>

              <motion.div variants={fadeIn} className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs text-center"
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-[#FF4B2B] to-[#FF9F1C] text-white text-sm font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'LOGIN'}
              </motion.button>
            </motion.form>

            <motion.div
              variants={fadeIn}
              className="mt-4 text-center"
            >
              <a href="#" className="text-xs text-gray-600 hover:text-orange-500 transition-colors duration-200">
                Forgot Password?
              </a>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="mt-4 text-center"
            >
              <p className="text-xs text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => router.push('/auth/register')}
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
                >
                  Register Now!
                </button>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 