/**
 * Servicio para gestionar planes de suscripcion
 */

import api from './api'
import type { Plan } from '../types'

/**
 * Obtiene todos los planes activos
 */
export async function getPlanes(): Promise<Plan[]> {
  const response = await api.get('/planes')
  return response.data
}

/**
 * Obtiene un plan por su ID
 */
export async function getPlanById(id: string): Promise<Plan> {
  const response = await api.get(`/planes/${id}`)
  return response.data
}

/**
 * Obtiene los planes activos para mostrar a usuarios
 */
export async function getPlanesActivos(): Promise<Plan[]> {
  const planes = await getPlanes()
  return planes.filter(plan => plan.estado === 1)
}