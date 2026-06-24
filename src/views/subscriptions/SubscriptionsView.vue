<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import Card from 'primevue/card'
import Popover from 'primevue/popover';
import ProgressSpinner from 'primevue/progressspinner';
import Paginator from 'primevue/paginator'
import type { PageState } from 'primevue/paginator'
import type { Suscripcion } from '../../types'
import IconPerson from "../../assets/person.svg"
import NoData from "../../assets/no-data.svg"
import { getListSuscripciones, cancelarSuscripcion } from '../../services/suscripciones'


const route = useRoute()
const router = useRouter()

const suscripciones = ref<Suscripcion[]>([])
const totalItems = ref(0)
const loading = ref(false)
const rowsPerPageOptions = [10, 20, 30]
const defaultRows = 10
const op = ref()

const toggle = (event: any) => {
  op.value[0].toggle(event);
}


const parsePage = (value: any) => {
  const parsedValue = Number(value)
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 1
}

const parseLimit = (value: any) => {
  const parsedValue = Number(value)
  return rowsPerPageOptions.includes(parsedValue) ? parsedValue : defaultRows
}

const parseSearch = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return ''
}

const searchTerm = ref<string>(parseSearch(route.query.search))
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

const currentPage = computed(() => parsePage(route.query.page))
const currentLimit = computed(() => parseLimit(route.query.limit))
const currentSearch = computed(() => parseSearch(route.query.search))

const firstRecord = computed(() => (currentPage.value - 1) * currentLimit.value)

const buildQuery = (page: number, limit: number, search: string) => {
  const query: LocationQueryRaw = {
    page: String(page),
    limit: String(limit),
  }

  if (search) {
    query.search = search
  }

  return query
}

const suspenderSuscripcion = async (userId: string) => {
  console.log('Suspender suscripción con ID:', userId)
  // return
  try {
    const res = await cancelarSuscripcion(userId)
    listarSuscripciones()
    console.log('Suscripción suspendida:', res)
  } catch (error) {
    console.error('Error al suspender la suscripción:', error)
  }
}

const listarSuscripciones = async (page = currentPage.value, limit = currentLimit.value, search = currentSearch.value) => {
  loading.value = true
  try {
    const response = await getListSuscripciones({
      page,
      limit,
      search: search || undefined,
    })
    suscripciones.value = response.data
    totalItems.value = response.totalItems
  } catch (error) {
    console.error('Error al cargar suscripciones:', error)
  } finally {
    loading.value = false
  }
}

const changePage = (event: PageState) => {
  void router.push({
    query: buildQuery(event.page + 1, event.rows, currentSearch.value),
  })
}

watch(
  () => [route.query.page, route.query.limit, route.query.search],
  async () => {
    const page = parsePage(route.query.page)
    const limit = parseLimit(route.query.limit)
    const search = parseSearch(route.query.search)
    const rawSearch = route.query.search

    const requiresNormalization =
      route.query.page !== String(page) ||
      route.query.limit !== String(limit) ||
      (search === '' ? Array.isArray(rawSearch) || rawSearch === '' : rawSearch !== search)

    if (requiresNormalization) {
      await router.replace({
        query: buildQuery(page, limit, search),
      })
      return
    }

    await listarSuscripciones(page, limit, search)
  },
  { immediate: true }
)

watch(currentSearch, (value) => {
  if (value !== searchTerm.value) {
    searchTerm.value = value
  }
}, { immediate: true })

watch(searchTerm, (value) => {
  if (value === currentSearch.value) {
    return
  }

  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    void router.replace({
      query: buildQuery(1, currentLimit.value, value),
    })
  }, 500)
})

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }
})
</script>

<template>
  <div>
    <Card>
      <template #header>
        <div class="flex flex-col gap-3 p-4 border-b border-gray-200 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-semibold">Suscripciones</h2>
          <div class="relative w-full sm:w-64">
            <i
              class="pi pi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Buscar..."
              v-model="searchTerm"
              class="w-full rounded-md border border-gray-200 py-1.5 pl-10 pr-3 outline-none"
            />
          </div>
        </div>
      </template>
      <template #content>
        <div v-if="loading" class="flex items-center justify-center py-10">
          <ProgressSpinner />
        </div>
        <div v-else-if="!loading && suscripciones.length === 0" class="flex flex-col items-center justify-center py-10 gap-4">
          <img :src="NoData" alt="No data" class="w-64 h-64 opacity-50" />
          <p class="text-gray-500">No hay registros.</p>
        </div>
        <div v-for="suscripcion in suscripciones" :key="suscripcion.id">
          <div class="relative z-0 border border-gray-200 md:min-w-3/12 sm:max-w-3/12 md:max-w-3/12 lg:max-w-3/12 rounded-xl p-4 transition-shadow duration-300 hover:z-10 hover:shadow-[0_6px_15px_rgba(15,23,42,0.16)]">
            <div class="flex items-center justify-between mb-4">
              <span :class="['status-badge', suscripcion.estado === 'activo' ? 'activa' : 'inactiva']">
                {{ suscripcion.estado }}
              </span>
              
              <button class="cursor-pointer" @click="toggle">
                <i class="pi pi-ellipsis-v text-gray-400" />
              </button>
              <Popover ref="op">
                <div class="flex flex-col gap-4">
                  <div>
                     <button class="cursor-pointer rounded-full p-1.5" @click="suspenderSuscripcion(suscripcion.userId)" title="Suspender suscripción">
                        <i class="pi pi-ban text-red-500" />
                     </button>
                  </div>
                </div>
              </Popover>
            </div>
            <img :src="IconPerson" alt="persona" class="mx-auto my-8 w-24 h-24 opacity-50" />
            <div class="text-center text-lg font-semibold text-gray-800">
              <span :class="suscripcion.tipoPlan == 'Premium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'" 
                    class="px-3 py-1 rounded-full text-sm font-medium">
                {{ suscripcion.tipoPlan }}
              </span>
            </div>  
            <div class="text-center text-gray-700 font-medium my-1.5">
              {{ suscripcion.nombreUsuario }} {{ suscripcion.apellidoUsuario }}
            </div>
            <div class="text-center text-gray-500 text-sm">
              {{ new Date(suscripcion.fechaInicio).toLocaleDateString() }} - {{ new Date(suscripcion.fechaFin).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <!-- <Paginator
          :first="firstRecord"
          :rows="paramsPaginator.limit"
          :totalRecords="totalItems"
          :rowsPerPageOptions="rowsPerPageOptions"
          template="RowsPerPageDropdown"
          @page="changePage"
        /> -->
        <Paginator v-if="!loading && suscripciones.length !== 0" :first="firstRecord" :rows="currentLimit" :totalRecords="totalItems"
          :rowsPerPageOptions="rowsPerPageOptions" @page="changePage" />
      </template>
    </Card>
  </div>
</template>

<style scoped>
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
