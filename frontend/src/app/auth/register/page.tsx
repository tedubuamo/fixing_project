'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { EyeIcon, EyeSlashIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/providers/AuthProvider'
import Image from 'next/image'
import type { Region, Branch, Cluster, RegisterFormData, Area } from '../types'
import { locationService } from '../services/location.service'
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

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomor_telepon: '',
    area: '',
    region: '',
    branch: '',
    cluster: '',
    role: 'user'
  })
  
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [regions, setRegions] = useState<Region[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      try {
        console.log('Fetching areas...')
        const areasData = await api.getAreas()
        console.log('Areas data received:', areasData)
        
        if (!Array.isArray(areasData)) {
          throw new Error('Invalid areas data received');
        }
        
        setAreas(areasData)
        
        // Hanya fetch data lain jika ada area yang dipilih
        if (formData.area) {
          console.log('Fetching regions for area:', formData.area)
          const regionsData = await api.getRegions(formData.area)
          setRegions(regionsData)
          
          if (formData.region) {
            console.log('Fetching branches for region:', formData.region)
            const branchesData = await api.getBranches(formData.region)
            setBranches(branchesData)
            
            if (formData.branch) {
              console.log('Fetching clusters for branch:', formData.branch)
              const clustersData = await api.getClusters(formData.branch)
              setClusters(clustersData)
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch location data:', err)
        toast.error('Gagal memuat data lokasi. Silakan coba lagi.')
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [formData.area, formData.region, formData.branch])

  // Handle area change
  const handleAreaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const areaId = e.target.value
    setFormData(prev => ({
      ...prev,
      area: areaId,
      region: '',
      branch: '',
      cluster: ''
    }))
    
    try {
      const regionsData = await api.getRegions(areaId)
      setRegions(regionsData)
      setBranches([])
      setClusters([])
    } catch (error) {
      console.error('Error loading regions:', error)
      toast.error('Gagal memuat data region')
    }
  }

  // Handle region change
  const handleRegionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value
    setFormData(prev => ({
      ...prev,
      region: regionId,
      branch: '',
      cluster: ''
    }))
    
    try {
      const branchesData = await api.getBranches(regionId)
      setBranches(branchesData)
      setClusters([])
    } catch (error) {
      console.error('Error loading branches:', error)
      toast.error('Gagal memuat data branch')
    }
  }

  // Handle branch change
  const handleBranchChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value
    setFormData(prev => ({ ...prev, branch: branchId, cluster: '' }))
    
    if (branchId) {
      try {
        setIsLoadingData(true)
        console.log('Fetching clusters for branch:', branchId)
        const clustersData = await api.getClusters(branchId)
        console.log('Clusters data received:', clustersData)
        
        if (Array.isArray(clustersData)) {
          setClusters(clustersData)
        } else {
          console.error('Invalid clusters data format:', clustersData)
          setClusters([])
        }
      } catch (error) {
        console.error('Error fetching clusters:', error)
        toast.error('Gagal mengambil data cluster')
        setClusters([])
      } finally {
        setIsLoadingData(false)
      }
    } else {
      setClusters([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Password dan konfirmasi password harus sama')
        return
      }

      // Validasi semua field required
      if (!formData.username || !formData.email || !formData.password || 
          !formData.nomor_telepon || !formData.area || !formData.region || 
          !formData.branch || !formData.cluster) {
        setError('Semua field harus diisi')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-register/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          no_telp: formData.nomor_telepon,
          area: formData.area,
          region: formData.region,
          branch: formData.branch,
          cluster: formData.cluster,
          role: '6'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Gagal melakukan registrasi')
      }

      if (data.status === 'Success') {
        toast.success('Registrasi berhasil!')
        router.push(`/auth/register/success?username=${encodeURIComponent(data.username)}`)
      } else {
        setError(data.error || 'Gagal mendaftar')
        toast.error(data.error || 'Gagal mendaftar')
      }

    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Gagal melakukan registrasi')
      toast.error(error.message || 'Gagal melakukan registrasi')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAreas = async () => {
    try {
      const areasData = await api.getAreas();
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading areas:', error);
      toast.error('Gagal memuat data area');
    }
  };

  const loadRegions = async (areaId: string) => {
    try {
      const regionsData = await api.getRegions(areaId);
      setRegions(regionsData);
    } catch (error) {
      console.error('Error loading regions:', error);
      toast.error('Gagal memuat data region');
    }
  };

  return (
    <div className="min-h-screen bg-white relative flex items-center justify-center p-4 overflow-hidden">
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

        {/* Card Register */}
        <motion.div
          variants={fadeIn}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-5 mx-4 sm:mx-0"
        >
          <motion.div 
            variants={fadeIn}
            className="text-center mb-4"
          >
            <h1 className="text-xl font-semibold gradient-text">
              Register to Account
            </h1>
          </motion.div>

          <motion.form 
            variants={staggerContainer}
            onSubmit={handleSubmit} 
            className="space-y-3"
          >
            {/* Form inputs */}
            <motion.div variants={fadeIn}>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm"
                placeholder="Username"
                required
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeIn}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm"
                placeholder="Email"
                required
              />
            </motion.div>

            {/* Nomor Telepon */}
            <motion.div variants={fadeIn}>
              <input
                type="tel"
                value={formData.nomor_telepon}
                onChange={(e) => setFormData({...formData, nomor_telepon: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm"
                placeholder="Nomor Telepon"
                required
              />
            </motion.div>

            {/* Password Fields */}
            {['password', 'confirmPassword'].map((key) => (
              <motion.div key={key} variants={fadeIn} className="relative">
                <input
                  type={showPasswords[key as keyof typeof showPasswords] ? "text" : "password"}
                  value={formData[key as keyof typeof formData]}
                  onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                  placeholder={key === 'password' ? 'Password' : 'Confirm Password'}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({
                    ...showPasswords,
                    [key]: !showPasswords[key as keyof typeof showPasswords]
                  })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords[key as keyof typeof showPasswords] ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </motion.div>
            ))}

            {/* Area Select */}
            <motion.div variants={fadeIn} className="relative">
              <select
                value={formData.area}
                onChange={handleAreaChange}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm appearance-none"
                required
                disabled={isLoadingData}
              >
                <option value="">Pilih Area</option>
                {areas.map(area => {
                  console.log('Rendering area option:', area)
                  return (
                    <option key={area.id_area} value={area.id_area}>
                      {area.area}
                    </option>
                  )
                })}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </motion.div>

            {/* Region Select */}
            <motion.div variants={fadeIn} className="relative">
              <select
                value={formData.region}
                onChange={handleRegionChange}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm appearance-none"
                required
                disabled={!formData.area || isLoadingData}
              >
                <option value="">Pilih Region</option>
                {regions.map(region => (
                  <option key={region.id_region} value={region.id_region}>
                    {region.region}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </motion.div>

            {/* Branch Select */}
            <motion.div variants={fadeIn} className="relative">
              <select
                value={formData.branch}
                onChange={handleBranchChange}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm appearance-none"
                required
                disabled={!formData.region || isLoadingData}
              >
                <option value="">Pilih Branch</option>
                {branches.map(branch => (
                  <option key={branch.id_branch} value={branch.id_branch}>
                    {branch.branch}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </motion.div>

            {/* Cluster Select */}
            <motion.div variants={fadeIn} className="relative">
              <select
                value={formData.cluster}
                onChange={(e) => setFormData({...formData, cluster: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 text-gray-900 text-sm appearance-none"
                required
                disabled={!formData.branch || isLoadingData}
              >
                <option value="">Pilih Cluster</option>
                {clusters.map(cluster => (
                  <option key={cluster.id_cluster} value={cluster.id_cluster}>
                    {cluster.cluster}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
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
              {isLoading ? 'Loading...' : 'SIGN UP'}
            </motion.button>
          </motion.form>

          <motion.div
            variants={fadeIn}
            className="mt-4 text-center"
          >
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors duration-200"
              >
                Login Now!
              </button>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
} 