export interface DashboardData {
  username: string;
  phone: string;
  marketingFee: string;
  chartData: {
    x: string;
    y: number;
  }[];
  usageItems: {
    name: string;
    percentage: number;
    amount: string;
    color: string;
  }[];
  recommendations: {
    id: number;
    recommendation: string;
    time: string;
  }[];
  totalSaldo: string;
  saldoPercentage: number;
}

export interface ClusterDashboardData {
  overview: {
    total_reports: number
    total_amount: number
    user_data: {
      username: string
      telp: string
    }
  }
  usage_details: any[] // sesuaikan dengan tipe data yang sebenarnya
  monthlyData: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }[]
  }
} 