import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
})

// Flag para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: Error) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

// Interceptor para agregar el token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta y refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Si no hay config o ya se intentó retry, rechazar
    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Si el error es 401 y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // No intentar refresh en rutas de auth (excepto /auth/me)
      const skipRefreshPaths = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh', '/auth/logout']
      if (skipRefreshPaths.some(path => originalRequest.url?.includes(path))) {
        return Promise.reject(error)
      }

      // Si ya se está refreshing, encolar la petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(api(originalRequest))
            },
            reject: (err: Error) => {
              reject(err)
            }
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        // No hay refresh token, hacer logout
        isRefreshing = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Intentar refrescar el token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        )

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

        // Guardar nuevos tokens
        localStorage.setItem('accessToken', newAccessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        // Actualizar header de la petición original
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        // Procesar cola de peticiones pendientes
        processQueue(null, newAccessToken)

        // Reintentar la petición original
        return api(originalRequest)
      } catch (refreshError) {
        // El refresh falló, hacer logout
        processQueue(new Error('Refresh failed'), null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
