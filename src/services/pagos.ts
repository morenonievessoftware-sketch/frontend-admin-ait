/**
 * Servicio para gestionar pagos con Wompi
 */

import api from './api'
import type {
  WompiConfig,
  IniciarPagoRequest,
  IniciarPagoResponse,
  VerificarPagoResponse,
  Pago,
  UsageStatus
} from '../types'

/**
 * Obtiene la configuracion publica de Wompi
 */
export async function getWompiConfig(): Promise<WompiConfig> {
  const response = await api.get('/pagos/config')
  return response.data.data
}

/**
 * Inicia un nuevo proceso de pago
 */
export async function iniciarPago(data: IniciarPagoRequest): Promise<IniciarPagoResponse> {
  const response = await api.post('/pagos/iniciar', data)
  return response.data
}

/**
 * Verifica el estado de un pago por su referencia
 */
export async function verificarPago(reference: string): Promise<VerificarPagoResponse> {
  const response = await api.get(`/pagos/verificar/${reference}`)
  return response.data
}

/**
 * Lista todos los pagos del usuario
 */
export async function listarPagos(): Promise<Pago[]> {
  const response = await api.get('/pagos')
  return response.data.data
}

/**
 * Obtiene un pago especifico por ID
 */
export async function obtenerPago(id: string): Promise<Pago> {
  const response = await api.get(`/pagos/${id}`)
  return response.data.data
}

/**
 * Obtiene estadisticas de pagos del usuario
 */
export async function obtenerEstadisticasPagos() {
  const response = await api.get('/pagos/estadisticas')
  return response.data.data
}

/**
 * Obtiene el estado de uso de IA del usuario
 */
export async function getUsageStatus(): Promise<UsageStatus> {
  const response = await api.get('/suscripciones/uso/status')
  return response.data.data
}

/**
 * Obtiene el historial de uso de IA
 */
export async function getUsageHistory(months: number = 6) {
  const response = await api.get(`/suscripciones/uso/historial?months=${months}`)
  return response.data.data
}