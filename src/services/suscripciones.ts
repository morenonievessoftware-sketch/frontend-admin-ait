import api from './api'
import type { Pagination, Suscripcion, paramsPagination } from '../types'

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

export const getListSuscripciones = async (params?: paramsPagination): Promise<Pagination<Suscripcion>> => {
  try {
    const { data } = await api.get('/suscripciones', { params: params ? { ...params } : undefined })
    console.log('listado de suscripciones:', data)
    return data
  } catch (error) {
    console.error('Error al obtener las suscripciones:', error)
    throw error
  }
}

// export const cancelarSuscripcion = async (id: string): Promise<Suscripcion> => {
export const cancelarSuscripcion = async (id: string) => {
  try {
    const { data } = await api.put(`/suscripciones/cancel/${id}`)
    return data
  } catch (error) {
    console.error(`Error al cancelar la suscripción con ID ${id}:`, error)
    throw error
  }
}
