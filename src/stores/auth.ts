import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types'

/**
 * 🍍 PINIA STORE - Auth
 *
 * Pinia es el gestor de estado oficial de Vue 3.
 * Es más simple que Vuex y tiene mejor soporte para TypeScript.
 *
 * Estructura:
 * - state: Variables reactivas (como data en componentes)
 * - getters: Valores computados (como computed en componentes)
 * - actions: Funciones que pueden ser async (como methods en componentes)
 */

export const useAuthStore = defineStore('auth', () => {
  // 📦 STATE - Variables reactivas
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let fetchUserPromise: Promise<User | null> | null = null

  // 🧮 GETTERS - Computed properties
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isTeacher = computed(() => user.value?.rol === 'teacher')
  const isAdmin = computed(() => user.value?.rol === 'admin')

  // 🎬 ACTIONS - Métodos (pueden ser async)

  async function login(credentials: LoginRequest) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      const { accessToken: token, refreshToken: refresh } = response.data

      // Guardar tokens
      accessToken.value = token
      refreshToken.value = refresh
      localStorage.setItem('accessToken', token)
      localStorage.setItem('refreshToken', refresh)

      // Obtener datos del usuario
      const usuario = await fetchUser()
      console.log(usuario,"el usuario logeado");
      

      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    isLoading.value = true
    error.value = null

    try {
      await api.post('/auth/register', data)

      // Después del registro, hacer login automático
      return await login({ email: data.email, password: data.password })
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al registrarse'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithGoogle(idToken: string) {
    isLoading.value = true
    error.value = null

    try {
      // Enviar el idToken de Google al backend para verificación
      const response = await api.post<AuthResponse & { isNewUser?: boolean }>('/auth/google', { idToken })
      const { accessToken: token, refreshToken: refresh } = response.data

      // Guardar tokens
      accessToken.value = token
      refreshToken.value = refresh
      localStorage.setItem('accessToken', token)
      localStorage.setItem('refreshToken', refresh)

      // Obtener datos del usuario
      await fetchUser()

      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al iniciar sesión con Google'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function handleGoogleCallback(token: string, refresh: string) {
    // Este método se llama cuando el usuario regresa del OAuth de Google
    accessToken.value = token
    refreshToken.value = refresh
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refresh)

    await fetchUser()
    return true
  }

  async function fetchUser(): Promise<User | null> {
  if (fetchUserPromise) return fetchUserPromise

  fetchUserPromise = (async () => {
    try {
      if (!accessToken.value) throw new Error('Token no válido')
      const { data } = await api.get<User>('/auth/me')
      user.value = data
      return user.value
    } catch (err:any) {
      if (err.response?.data?.error) logout()
      throw err
    } finally {
      fetchUserPromise = null
    }
  })()
  return fetchUserPromise
}

  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  // Inicializar: Si hay token guardado, cargar el usuario
  if (accessToken.value) {
    fetchUser()
  }

  // Retornar todo lo que queremos exponer
  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isTeacher,
    isAdmin,

    // Actions
    login,
    register,
    logout,
    fetchUser,
    loginWithGoogle,
    handleGoogleCallback
  }
})
