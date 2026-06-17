<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Paginator from 'primevue/paginator'
import type { PageState } from 'primevue/paginator'
import { getListSuscripciones } from '../../services/suscripciones'
import type { Suscripcion } from '../../types'

const route = useRoute()
const router = useRouter()

const suscripciones = ref<Suscripcion[]>([])
const totalItems = ref(0)
const loading = ref(false)
const rowsPerPageOptions = [10, 20, 30]
const defaultRows = 10

const parsePage = (value: unknown) => {
  const parsedValue = Number(value)
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 1
}

const parseLimit = (value: unknown) => {
  const parsedValue = Number(value)
  return rowsPerPageOptions.includes(parsedValue) ? parsedValue : defaultRows
}

const currentPage = computed(() => parsePage(route.query.page))
const currentLimit = computed(() => parseLimit(route.query.limit))

const firstRecord = computed(() => (currentPage.value - 1) * currentLimit.value)

const listarSuscripciones = async () => {
  loading.value = true
  try {
    const response = await getListSuscripciones({
      page: currentPage.value,
      limit: currentLimit.value,
    })
    suscripciones.value = response.data
    totalItems.value = response.totalItems
  } catch (error) {
    console.error('Error al cargar suscripciones:', error)
  } finally {
    loading.value = false
  }
}

const syncPaginationToUrl = async (page: number, limit: number) => {
  const nextPage = String(page)
  const nextLimit = String(limit)

  if (route.query.page === nextPage && route.query.limit === nextLimit) {
    return true
  }

  await router.replace({
    query: {
      ...route.query,
      page: nextPage,
      limit: nextLimit,
    },
  })

  return false
}

const changePage = (event: PageState) => {
  void router.push({
    query: {
      ...route.query,
      page: String(event.page + 1),
      limit: String(event.rows),
    },
  })
}

watch(
  [currentPage, currentLimit],
  async ([page, limit]) => {
    const shouldFetch = await syncPaginationToUrl(page, limit)

    if (!shouldFetch) {
      return
    }

    void listarSuscripciones()
  },
  { immediate: true }
)
</script>

<template>
  <div>
    <Card>
      <template #header>
        <div class="card-header">
          <h2>Suscripciones</h2>
          <Button label="Nueva Suscripcion" icon="pi pi-plus" />
        </div>
      </template>
      <template #content>
        <DataTable
          :value="suscripciones"
          :loading="loading"
          stripedRows
          emptyMessage="No hay suscripciones registradas"
        >
          <Column header="Usuario" sortable>
            <template #body="{ data }">
              {{ data.nombreUsuario }} {{ data.apellidoUsuario }}
            </template>
          </Column>
          <Column header="Plan">
            <template #body="{ data }">
              {{ data.tipoPlan }}
            </template>
          </Column>
          <Column header="Estado">
            <template #body="{ data }">
              <span :class="['status-badge', data.estado === 'activo' ? 'activa' : 'inactiva']">
                {{ data.estado }}
              </span>
            </template>
          </Column>
          <Column header="Fecha de Inicio">
            <template #body="{ data }">
              {{ new Date(data.fechaInicio).toLocaleDateString() }}
            </template>
          </Column>
          <Column header="Fecha de Fin">
            <template #body="{ data }">
              {{ new Date(data.fechaFin).toLocaleDateString() }}
            </template>
          </Column>

          <Column header="Acciones">
            <template #body>
              <div class="actions">
                <Button icon="pi pi-eye" text rounded severity="info" />
                <Button icon="pi pi-ban" text rounded severity="danger" />
              </div>
            </template>
          </Column>
        </DataTable>
        <!-- <Paginator
          :first="firstRecord"
          :rows="paramsPaginator.limit"
          :totalRecords="totalItems"
          :rowsPerPageOptions="rowsPerPageOptions"
          template="RowsPerPageDropdown"
          @page="changePage"
        /> -->
        <Paginator
          :first="firstRecord"
          :rows="currentLimit"
          :totalRecords="totalItems"
          :rowsPerPageOptions="rowsPerPageOptions"
          @page="changePage"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.activa {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactiva {
  background: #fee2e2;
  color: #991b1b;
}
</style>
