import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)

          // Validate token by fetching latest profile
          const { data } = await authAPI.getProfile()
          const profileUser = data.user || data
          setUser(profileUser)
          localStorage.setItem('user', JSON.stringify(profileUser))
        } catch (error) {
          // Token expired or invalid — clear everything
          console.error('Auth initialization failed:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          setUser(null)
          setIsAuthenticated(false)
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  // ─── Register ──────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    try {
      const { data } = await authAPI.register(userData)

      localStorage.setItem('token', data.token)
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      const registeredUser = data.user || data
      localStorage.setItem('user', JSON.stringify(registeredUser))
      setUser(registeredUser)
      setIsAuthenticated(true)

      toast.success('Welcome to The Grand Palatial!')
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─── Login ─────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    try {
      const { data } = await authAPI.login(credentials)

      localStorage.setItem('token', data.token)
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      const loggedInUser = data.user || data
      localStorage.setItem('user', JSON.stringify(loggedInUser))
      setUser(loggedInUser)
      setIsAuthenticated(true)

      toast.success(`Welcome back, ${loggedInUser.name || loggedInUser.email}!`)
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─── Send OTP ──────────────────────────────────────────────────
  const sendOTP = useCallback(async (phone) => {
    try {
      const { data } = await authAPI.sendOTP(phone)
      toast.success('OTP sent successfully!')
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─── Verify OTP ────────────────────────────────────────────────
  const verifyOTP = useCallback(async (phone, otp) => {
    try {
      const { data } = await authAPI.verifyOTP(phone, otp)

      localStorage.setItem('token', data.token)
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      const verifiedUser = data.user || data
      localStorage.setItem('user', JSON.stringify(verifiedUser))
      setUser(verifiedUser)
      setIsAuthenticated(true)

      toast.success('Phone verified successfully!')
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─── Logout ────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Server-side logout may fail — still clear local state
      console.warn('Server logout failed:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
      toast.success('You have been logged out.')
    }
  }, [])

  // ─── Update Profile ────────────────────────────────────────────
  const updateProfile = useCallback(async (profileData) => {
    try {
      const { data } = await authAPI.updateProfile(profileData)
      const updatedUser = data.user || data
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Profile updated successfully!')
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─── Change Password ──────────────────────────────────────────
  const changePassword = useCallback(async (passwordData) => {
    try {
      const { data } = await authAPI.changePassword(passwordData)
      toast.success('Password changed successfully!')
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─── Forgot Password ──────────────────────────────────────────
  const forgotPassword = useCallback(async (email) => {
    try {
      const { data } = await authAPI.forgotPassword(email)
      toast.success('Password reset link sent to your email!')
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  // ─── Reset Password ───────────────────────────────────────────
  const resetPassword = useCallback(async (token, password) => {
    try {
      const { data } = await authAPI.resetPassword(token, password)
      toast.success('Password reset successfully! Please log in.')
      return { success: true, data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password.'
      toast.error(message)
      return { success: false, error: message }
    }
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    sendOTP,
    verifyOTP,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
