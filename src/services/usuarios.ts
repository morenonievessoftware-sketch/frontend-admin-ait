import api from './api'
import type { Usuario, Pagination, paramsPagination } from '../types'   


export const getListUsuarios = async (params?: paramsPagination): Promise<Pagination<Usuario>> => {
  try {
    const {data} = await api.get('/users', { params: params ? { ...params } : '' })
    return data
  } catch (error) {
    console.error('Error al obtener los usuarios:', error)
    throw error
  }
}