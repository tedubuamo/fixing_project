'use client'

import { Header } from '@/app/components/Header'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function ErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto px-4"
        >
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              Akses Ditolak
            </h1>
            <p className="text-gray-600 mb-6">
              Anda tidak memiliki akses pada cluster ini!
            </p>
            <button
              onClick={() => router.back()}
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
            >
              Kembali
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}