'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function RegisterSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const username = searchParams.get('username')

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4">
      {/* Background Gradient */}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center relative z-10"
      >
        <Image 
          src="/telkomsel.svg"
          alt="Telkomsel Logo"
          width={80}
          height={80}
          className="mx-auto mb-6"
        />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Registrasi Berhasil!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Selamat datang, <span className="font-semibold">{username}</span>!
          <br />
          Akun Anda telah berhasil dibuat.
        </p>

        <button
          onClick={() => router.push('/auth/login')}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-[#FF4B2B] to-[#FF9F1C] text-white text-sm font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200"
        >
          Login Sekarang
        </button>
      </motion.div>
    </div>
  )
} 