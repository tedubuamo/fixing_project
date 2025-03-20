export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  nomor_telepon: string
  area: string
  region: string
  branch: string
  cluster: string
  role: string
}

export const authService = {
  login: async (credentials: LoginData) => {
    try {
      // Get CSRF token first
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf-token/`, {
        credentials: 'include'
      })
      const { csrftoken } = await csrfResponse.json()

      // Login request
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-login/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      return response.json()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  register: async (data: RegisterData) => {
    try {
      // Get CSRF token first
      const csrfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/csrf-token/`, {
        credentials: 'include'
      })
      const { csrftoken } = await csrfResponse.json()

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-register/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }

      return response.json()
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-logout/`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Logout failed')
      }

      // Clear local storage and cookies
      localStorage.removeItem('auth_token')
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

      return response.json()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-session/`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to get current user')
      }

      return response.json()
    } catch (error) {
      console.error('Get current user error:', error)
      throw error
    }
  },

  sendOtp: async (phoneNumber: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-register/send-otp/${phoneNumber}`, {
          method: 'POST',
          credentials: 'include'
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send OTP')
      }

      return response.json()
    } catch (error) {
      console.error('Send OTP error:', error)
      throw error
    }
  },

  checkOtpStatus: async (phoneNumber: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-register/status-otp/${phoneNumber}`, {
          credentials: 'include'
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to check OTP status')
      }

      return response.json()
    } catch (error) {
      console.error('Check OTP status error:', error)
      throw error
    }
  }
} 