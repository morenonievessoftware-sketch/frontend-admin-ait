import api from './api'
import type { Suscripcion } from '../types'

/**
 * Obtiene la suscripción activa del usuario autenticado
 */
export async function getSuscripcionActiva(): Promise<Suscripcion | null> {
  try {
    const response = await api.get('/suscripciones/activa')
    return response.data.data || response.data
  } catch (error: any) {
    // Si no tiene suscripción activa, retorna null
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}
