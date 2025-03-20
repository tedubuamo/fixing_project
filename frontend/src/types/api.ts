// Add proper typing for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardResponse {
  user_data: {
    username: string;
    telp: string;
  };
  marketing_fee: Array<{
    total: number;
  }>;
  report_data: Array<{
    id_poin: number;
    type: string;
    total_amount: number;
    percentage: number;
  }>;
  total_fee: number;
  percentage_fee: number;
} 