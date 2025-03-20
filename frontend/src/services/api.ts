const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  nomor_telepon: string;
  area: string;
  region: string;
  branch: string;
  cluster: string;
  role: string;
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const api = {
  // Auth endpoints
  getCsrfToken: async () => {
    const response = await fetch(`${BASE_URL}/csrf-token/`, {
      credentials: 'include'
    });
    return handleResponse(response);
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await fetch(`${BASE_URL}/api/user-login/`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(credentials)
      })

      const data = await response.json()

      // Log untuk debugging
      console.log('Raw API Response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      return data // Return raw response untuk diproses di login page
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  },

  register: async (data: RegisterData) => {
    const res = await fetch(`${BASE_URL}/api/user-register/`, {
      method: 'POST',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  sendOtp: async (phoneNumber: string) => {
    const res = await fetch(`${BASE_URL}/api/user-register/send-otp/${phoneNumber}`);
    return res.json();
  },

  checkOtpStatus: async (phoneNumber: string) => {
    const res = await fetch(`${BASE_URL}/api/user-register/status-otp/${phoneNumber}`);
    return res.json();
  },

  // Reports
  getReports: async (userId: string) => {
    const res = await fetch(`${BASE_URL}/api/user-overview/${userId}/`);
    return res.json();
  },

  // Dashboard endpoints
  getDashboardData: async (userId: string, month: string, year: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/user-dashboard/${userId}/?month=${month}&year=${year}`,
        {
          credentials: 'include',
          headers: defaultHeaders
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      return response.json()
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  },

  getMarketingFee: async (userId: string, month: string) => {
    const response = await fetch(
      `${BASE_URL}/api/marketing-fee/${userId}/?month=${month}`, {
        credentials: 'include',
        headers: defaultHeaders
      }
    );
    return handleResponse(response);
  },

  getReportsByPoin: async (userId: string, poinId: string, month: string, year: string) => {
    const response = await fetch(
      `${BASE_URL}/api/reports/${userId}/${poinId}/?month=${month}&year=${year}`, {
        credentials: 'include',
        headers: defaultHeaders
      }
    );
    return handleResponse(response);
  },

  // Report Management
  createReport: async (formData: FormData) => {
    const response = await fetch(`${BASE_URL}/api/reports/create/`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    return handleResponse(response);
  },

  deleteReport: async (reportId: number) => {
    const response = await fetch(`${BASE_URL}/api/reports/delete/${reportId}/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: defaultHeaders
    });
    return handleResponse(response);
  },

  // Marketing Fee
  getMonthlyMarketingFee: async (userId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/marketing-fee/${userId}/`, {
          credentials: 'include',
          headers: defaultHeaders
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch marketing fee data');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching monthly marketing fee:', error);
      throw error;
    }
  },

  // Recommendations
  createRecommendation: async (userId: string, data: any) => {
    const response = await fetch(
      `${BASE_URL}/api/recommendations/${userId}/`, {
        method: 'POST',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(data)
      }
    );
    return handleResponse(response);
  },

  // Location Services
  getAreas: async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/locations/areas/`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error fetching areas:', error);
      throw error;
    }
  },

  getRegions: async (areaId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/locations/regions/${areaId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  },

  getBranches: async (regionId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/locations/branches/${regionId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  getClusters: async (branchId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/locations/clusters/${branchId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: defaultHeaders
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error fetching clusters:', error);
      throw error;
    }
  },

  getAdminDashboard: async (params: { 
    area?: string, 
    region?: string, 
    branch?: string,
    cluster?: string,
    month?: string,
    year?: string 
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await fetch(
      `${BASE_URL}/api/admin/dashboard/?${queryParams.toString()}`, {
        credentials: 'include',
        headers: defaultHeaders
      }
    );
    return handleResponse(response);
  },

  getLocationHierarchy: async () => {
    const response = await fetch(`${BASE_URL}/api/locations/hierarchy/`, {
      credentials: 'include',
      headers: defaultHeaders
    });
    return handleResponse(response);
  },

  // User Profile
  updateUserProfile: async (userId: string, data: any) => {
    const response = await fetch(
      `${BASE_URL}/api/users/${userId}/profile/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: defaultHeaders,
        body: JSON.stringify(data)
      }
    );
    return handleResponse(response);
  },

  getClusterDashboardData: async (
    clusterId: string, 
    month: string, 
    year: string,
    signal?: AbortSignal
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/cluster/${clusterId}/dashboard?month=${month}&year=${year}`,
        {
          credentials: 'include',
          signal
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      return await response.json()
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      throw new Error('Failed to fetch dashboard data')
    }
  },

  getBranchClusters: async (branchId: string) => {
    try {
      const response = await fetch(`/api/locations/clusters/${branchId}`, {
        credentials: 'include',
        headers: {
          ...defaultHeaders,
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: `HTTP error! status: ${response.status}`
        }))
        throw new Error(error.error || 'Failed to fetch branch clusters')
      }
      
      const data = await response.json()
      console.log('Cluster data:', data)
      return data
      
    } catch (error) {
      console.error('Error fetching clusters:', error)
      throw error
    }
  },

  getClusterDashboardFromBranch: async (
    clusterId: string,
    month: string,
    year: string,
    signal?: AbortSignal
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/branch/clusters/${clusterId}/dashboard?month=${month}&year=${year}`,
        {
          credentials: 'include',
          signal
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch cluster dashboard data')
      }

      return await response.json()
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      throw new Error('Failed to fetch cluster dashboard data')
    }
  },

  getClusterDashboard: async (clusterId: string, month: string, year: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/clusters/${clusterId}/dashboard?month=${month}&year=${year}`,
        {
          credentials: 'include',
          headers: defaultHeaders
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch cluster dashboard')
      }

      return await response.json()
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      console.error('Error fetching cluster dashboard:', error)
      throw new Error('Failed to fetch cluster dashboard')
    }
  },

  checkClusterAccess: async (branchId: string, clusterId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/branch/${branchId}/clusters/check-access/${clusterId}`,
        {
          credentials: 'include',
          headers: defaultHeaders
        }
      )

      if (!response.ok) {
        throw new Error('Failed to check cluster access')
      }

      const data = await response.json()
      return data.hasAccess
    } catch (error: unknown) {
      console.error('Error checking cluster access:', error)
      return false
    }
  }
};