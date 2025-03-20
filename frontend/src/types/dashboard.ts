export interface ClusterData {
  reports: Array<{
    id: number
    description: string
    amount_used: number
    image_url: string
    time: string
    user: {
      id: number
      username: string
    }
    poin: {
      id: number
      name: string
      type: string
    }
  }>
  overview: {
    totalBudget: number
    usedBudget: number
    monthlyData: Array<{
      month: string
      amount: number
    }>
  }
  usageDetails: Array<{
    poin_id: number
    poin_name: string
    amount_used: number
    percentage: number
  }>
  clusterInfo: {
    username: string
    totalUsers: number
  } | null
} 