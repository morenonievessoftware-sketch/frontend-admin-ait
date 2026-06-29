<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from 'primevue/card'
import Popover from 'primevue/popover'
import ProgressSpinner from 'primevue/progressspinner'
import Paginator from 'primevue/paginator'
import type { PageState } from 'primevue/paginator'
import type { Suscripcion } from '../../types'
import IconPerson from '../../assets/person.svg'
import NoData from '../../assets/no-data.svg'
import { getListSuscripciones, cancelarSuscripcion } from '../../services/suscripciones'
import Toast from '../../components/ui/toast.vue'

interface ToastData {
  title: string
  message: string
  type?: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'
}

const route = useRoute()
const router = useRouter()

const LIMIT_DEFAULT = 10
const rowsPerPageOptions = [10, 20, 30]

const suscripciones = ref<Suscripcion[]>([])
const paginate = ref({
  page: 1,
  first: 0,       // Índice del primer ítem (base 0) — requerido por PrimeVue Paginator
  totalRecords: 0,
  limit: LIMIT_DEFAULT
})
const searchQuery = ref('')
const loading = ref(false)
const toast = ref<ToastData>({ title: '', message: '' })
const op = ref<any[]>([])

let searchTimeout: ReturnType<typeof setTimeout> | undefined

const toggle = (event: MouseEvent, index: number) => {
  op.value[index]?.toggle(event)
}

const listarSuscripciones = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: paginate.value.page,
      limit: paginate.value.limit,
    }
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }
    const response = await getListSuscripciones(params)
    suscripciones.value      = response.data
    paginate.value.totalRecords = response.pagination.totalItems
    paginate.value.limit     = response.pagination.limit
  } catch (error) {
    console.error('Error al cargar suscripciones:', error)
  } finally {
    loading.value = false
  }
}

// ─── URL Sync ────────────────────────────────────────────────────────────────
// La URL es la fuente de verdad. Todo cambio (búsqueda o paginación)
// actualiza la URL, y este watcher reacciona para fetchear los datos.

watch(
  () => route.query,
  (query) => {
    const newPage   = Number(query.page)   || 1
    const newLimit  = Number(query.limit)  || LIMIT_DEFAULT
    const newSearch = String(query.search  || '')

    searchQuery.value    = newSearch
    paginate.value.page  = newPage
    paginate.value.limit = newLimit
    paginate.value.first = (newPage - 1) * newLimit

    listarSuscripciones()
  },
  { immediate: true }
)

const actualizarURL = (overwrites: { page?: number; search?: string | null } = {}) => {
  const query: Record<string, string | number> = {}

  const search = 'search' in overwrites ? overwrites.search : searchQuery.value
  const page   = overwrites.page ?? paginate.value.page

  if (search) query.search = search
  query.page  = page
  query.limit = paginate.value.limit

  router.replace({ query })
}

const changePage = (event: PageState) => {
  paginate.value.first = event.first
  paginate.value.limit = event.rows
  actualizarURL({ page: event.page + 1 })
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    actualizarURL({ search: searchQuery.value || null, page: 1 })
  }, 500)
}

onBeforeUnmount(() => clearTimeout(searchTimeout))

const suspenderSuscripcion = async (userId: string) => {
  try {
    await cancelarSuscripcion(userId)
    await listarSuscripciones()
    toast.value = { title: '', message: '' }
    await nextTick()
    toast.value = {
      title: 'Suscripción suspendida',
      message: 'La suscripción fue suspendida correctamente.',
      type: 'success',
    }
  } catch (error) {
    console.error('Error al suspender la suscripción:', error)
    toast.value = { title: '', message: '' }
    await nextTick()
    toast.value = {
      title: 'Error',
      message: 'No fue posible suspender la suscripción.',
      type: 'error',
    }
  }
}
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
              v-model="searchQuery"
              @input="onSearchInput"
              class="w-full rounded-md border border-gray-200 py-1.5 pl-10 pr-3 outline-none"
            />
          </div>
        </div>
      </template>

      <template #content>
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-10">
          <ProgressSpinner />
        </div>

        <!-- Sin resultados -->
        <!-- FIX: eliminado !loading redundante; v-else-if ya implica que v-if es falso -->
        <div v-else-if="suscripciones.length === 0" class="flex flex-col items-center justify-center py-10 gap-4">
          <img :src="NoData" alt="Sin datos" class="w-64 h-64 opacity-50" />
          <p class="text-gray-500">
            No hay registros{{ searchQuery ? ` para "${searchQuery}"` : '' }}.
          </p>
        </div>

        <!-- FIX: wrapper flex para que las tarjetas se dispongan en grilla horizontal.
             Antes faltaba este contenedor y las tarjetas se apilaban verticalmente. -->
        <div v-else class="flex flex-wrap gap-4 p-2">
          <!-- FIX: se expone `index` en el v-for para pasarlo al toggle del popover -->
          <div
            v-for="(suscripcion, index) in suscripciones"
            :key="suscripcion.id"
            class="relative z-0 border border-gray-200 w-64 rounded-xl p-4 transition-shadow duration-300 hover:z-10 hover:shadow-[0_6px_15px_rgba(15,23,42,0.16)]"
          >
            <div class="flex items-center justify-between mb-4">
              <span :class="['status-badge', suscripcion.estado === 'activo' ? 'activa' : 'inactiva']">
                {{ suscripcion.estado }}
              </span>

              
              <button
                class="cursor-pointer"
                aria-label="Opciones de suscripción"
                @click="toggle($event, index)"
              >
                <i class="pi pi-ellipsis-v text-gray-400" />
              </button>

              
              <Popover ref="op">
                <div class="flex flex-col gap-2">
                  <button
                    class="cursor-pointer rounded-full p-1.5 flex items-center gap-2 text-red-500 hover:bg-red-50 transition-colors"
                    title="Suspender suscripción"
                    @click="suspenderSuscripcion(suscripcion.userId)"
                  >
                    <i class="pi pi-ban" />
                    <span class="text-sm">Suspender</span>
                  </button>
                </div>
              </Popover>
            </div>

            <img :src="IconPerson" alt="persona" class="mx-auto my-8 w-24 h-24 opacity-50" />

            <div class="text-center text-lg font-semibold text-gray-800">
              <span
                :class="suscripcion.tipoPlan === 'Premium' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ suscripcion.tipoPlan }}
              </span>
            </div>

            <div class="text-center text-gray-700 font-medium my-1.5">
              {{ suscripcion.nombreUsuario }} {{ suscripcion.apellidoUsuario }}
            </div>

            <div class="text-center text-gray-500 text-sm">
              {{ new Date(suscripcion.fechaInicio).toLocaleDateString() }} –
              {{ new Date(suscripcion.fechaFin).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <Paginator
          v-if="!loading && suscripciones.length > 0"
          :first="paginate.first"
          :rows="paginate.limit"
          :totalRecords="paginate.totalRecords"
          :rowsPerPageOptions="rowsPerPageOptions"
          @page="changePage"
        />
      </template>
    </Card>
  </div>

  <Toast :title="toast.title" :message="toast.message" :type="toast.type" :focusOnShow="false" />
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