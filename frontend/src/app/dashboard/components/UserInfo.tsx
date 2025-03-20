'use client'

interface UserInfoProps {
  username: string
  phone: string
  marketingFee: number | string
  totalUsage?: number
  role: string
  user?: {
    role_id?: number
  }
}

export function UserInfo({ username, phone, marketingFee, totalUsage, role, user }: UserInfoProps) {
  console.log('UserInfo role:', role)

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin_area':
        return 'bg-blue-500/20 text-blue-100'
      case 'admin_region':
        return 'bg-red-500/20 text-red-100'
      case 'admin_branch':
        return 'bg-purple-500/20 text-purple-100'
      case 'admin_cluster':
        return 'bg-yellow-500/20 text-yellow-100'
      default:
        return 'bg-blue-500/20 text-blue-100'
    }
  }

  const getRoleDisplay = (role: string, roleId?: number) => {
    if (role === 'admin_cluster' && roleId) {
      switch (roleId) {
        case 4:
          return 'MCOT Cluster'
        case 5:
          return 'GM SBP Cluster'
        default:
          return 'Admin Cluster'
      }
    }

    switch (role) {
      case 'admin_area':
        return 'Admin Area'
      case 'admin':
        return 'Admin'
      case 'admin_region':
        return 'Admin Region'
      case 'admin_branch':
        return 'Admin Branch'
      case 'user_cluster':
        return 'SBP Cluster'
      default:
        return 'User'
    }
  }
  
  // Ambil bulan saat ini untuk filter
  const currentMonth = new Date().toLocaleString('id-ID', { month: 'long' })
  
  const formatMarketingFee = (fee: number | string, role: string) => {
    if (typeof fee === 'string') return fee

    const formattedFee = fee.toLocaleString('id-ID')
    
    // Untuk user cluster, tampilkan format "total_usage / marketing_fee"
    if (role === 'user_cluster' && totalUsage !== undefined) {
      return `${totalUsage.toLocaleString('id-ID')} / ${formattedFee}`
    }

    return `${formattedFee} / -`
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white">
          {username}
        </h2>
        <p className="text-white/80 text-sm">
          {phone}
        </p>
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeStyle(role)}`}>
          {getRoleDisplay(role, user?.role_id)}
        </span>
      </div>
      <div className="mt-4 sm:mt-0 text-right">
        <p className="text-sm text-white/80">Marketing Fee</p>
        <p className="text-2xl font-semibold text-white">
          Rp {formatMarketingFee(marketingFee, role)}
        </p>
      </div>
    </div>
  )
} 