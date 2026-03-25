import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'
import type { CreateIaQueryRequest, IaQuery, IaQueryResponse } from '../types'

export const useIaStore = defineStore('ia', () => {
  // State
  const queries = ref<IaQuery[]>([])
  const currentQuery = ref<IaQuery | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function createQuery(request: CreateIaQueryRequest) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post<IaQueryResponse>('/ia', request)
      const newQuery: IaQuery = {
        id: response.data.iaQueryId,
        userId: response.data.material.userId,
        prompt: request.prompt,
        response: response.data.material.content,
        tokensUsed: 0,
        status: 'completed',
        createdAt: response.data.material.createdAt
      }

      queries.value.unshift(newQuery) // Agregar al inicio
      currentQuery.value = newQuery

      return newQuery
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al crear consulta de IA'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserQueries() {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<IaQuery[]>('/ia/user')
      queries.value = response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al obtener consultas'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchQueryById(id: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<IaQuery>(`/ia/${id}`)
      currentQuery.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al obtener consulta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteQuery(id: string) {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/ia/${id}`)
      queries.value = queries.value.filter(q => q.id !== id)

      if (currentQuery.value?.id === id) {
        currentQuery.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Error al eliminar consulta'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    queries,
    currentQuery,
    isLoading,
    error,

    // Actions
    createQuery,
    fetchUserQueries,
    fetchQueryById,
    deleteQuery,
    clearError
  }
})
