<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from "vue"
import { useRouter, useRoute } from 'vue-router'
import api from "../../services/api"
import type { Usuario } from "../../types"
import { getListUsuarios } from "../../services/usuarios.ts"
import Card from "primevue/card"
import Popover from "primevue/popover"
import Button from "primevue/button"
import ToggleSwitch from "primevue/toggleswitch"
import InputText from "primevue/inputtext"
import IconField from "primevue/iconfield"
import InputIcon from "primevue/inputicon"
import FormCreateEditUser from "./components/FormCreateEditUser.vue"
import Paginator from 'primevue/paginator'
import Toast from "../../components/ui/toast.vue"
import IconPerson from "../../assets/person.svg"
import NoData from "../../assets/no-data.svg"

interface Toast {
  title: string
  message: string
  type?: "success" | "info" | "warn" | "error" | "secondary" | "contrast"
}

const router = useRouter()
const route = useRoute()

const LIMIT_DEFAULT = 10

const op = ref<any[]>([])
const users = ref<Usuario[]>([])
const paginate = ref({
  page: 1,
  first: 0,       
  totalRecords: 0,
  limit: LIMIT_DEFAULT
})
const searchQuery = ref('')
const loading = ref(false)
const toggleCreateEditUser = ref(false)
const toast = ref<Toast>({ title: "", message: "" })

let searchTimeout: ReturnType<typeof setTimeout> | undefined

const toggle = (event: MouseEvent, index: number) => {
  op.value[index]?.toggle(event)
}

const listarUsuarios = async () => {
  try {
    loading.value = true

    const params: Record<string, string | number> = {
      page: paginate.value.page,
      limit: paginate.value.limit,
    }
    // Solo incluir search si el usuario escribió algo
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    const res = await getListUsuarios(params)
    users.value = res.data
    paginate.value.totalRecords = res.pagination.totalItems
    paginate.value.limit = res.pagination.limit
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

watch(
  () => route.query,
  (query) => {
    const newPage = Number(query.page) || 1
    const newLimit = Number(query.limit) || LIMIT_DEFAULT
    const newSearch = String(query.q || '')

    searchQuery.value = newSearch
    paginate.value.page = newPage
    paginate.value.limit = newLimit
    paginate.value.first = (newPage - 1) * newLimit

    listarUsuarios()
  },
  { immediate: true }
)

const actualizarURL = (overwrites: { page?: number; q?: string | null } = {}) => {
  const query: Record<string, string | number> = {}

  const search = 'q' in overwrites ? overwrites.q : searchQuery.value
  const page = overwrites.page ?? paginate.value.page

  if (search) query.q = search
  query.page = page
  query.limit = paginate.value.limit

  router.replace({ query })
}

const changePaginator = (event: any) => {
  paginate.value.first = event.first
  actualizarURL({ page: event.page + 1 })
}

const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    actualizarURL({ q: searchQuery.value || null, page: 1 })
  }, 500)
}

const limpiarBusqueda = () => {
  searchQuery.value = ''
  actualizarURL({ q: null, page: 1 })
}

onBeforeUnmount(() => clearTimeout(searchTimeout))

const cambioEstadoUsuario = async (userId: string) => {
  try {
    await api.patch(`/users/${userId}/estado`)
    toast.value = { title: "", message: "" }
    await nextTick()
    toast.value = {
      title: "Estado actualizado",
      message: "El estado del usuario se actualizó correctamente",
      type: "success"
    }
  } catch (error) {
    toast.value = {
      title: "Error al actualizar",
      message: "No fue posible actualizar el estado",
      type: "error"
    }
    console.error("No es posible actualizar estado del usuario", error)
  }
}
</script>

<template>
  <div>
    <Card>
      <template #header>
        <div class="card-header">
          <h2>Listado de Usuarios</h2>
          <div class="header-actions">
            <!-- Buscador -->
            <div class="search-wrapper">
              <IconField>
                <InputIcon class="pi pi-search" />
                <InputText v-model="searchQuery" placeholder="Buscar usuario..." @input="onSearchInput" />
              </IconField>
              <Button v-if="searchQuery" icon="pi pi-times" text rounded severity="secondary" size="small"
                aria-label="Limpiar búsqueda" @click="limpiarBusqueda" />
            </div>

            <Button label="Nuevo Usuario" icon="pi pi-plus" @click="toggleCreateEditUser = true" />
          </div>
        </div>
      </template>

      <template #content>
        <div v-if="loading" class="feedback-state">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem;" />
        </div>

        <!-- Sin resultados -->
        <div v-else-if="users.length === 0" class="feedback-state">
          <img :src="NoData" alt="No results" class="size-40" />
          <p>No se encontraron usuarios{{ searchQuery ? ` para "${searchQuery}"` : '' }}.</p>
        </div>

        <!-- Lista de usuarios -->
        <div v-else class="flex flex-wrap gap-4">
          <div v-for="(user, index) in users" :key="user.id">
            <Card class="w-xs overflow-hidden text-center">
              <template #header>
                <div class="flex justify-between p-4">
                  <ToggleSwitch v-model="user.estado" @change="cambioEstadoUsuario(user.id)" />
                  <button class="cursor-pointer" @click="toggle($event, index)">
                    <i class="pi pi-ellipsis-v h-1.5" />
                  </button>
                  <Popover ref="op">
                    <div class="flex flex-col gap-2 p-2">
                      <button class="cursor-pointer" @click="toggleCreateEditUser = true">
                        <i class="pi pi-pencil" />
                      </button>
                      <button class="cursor-pointer">
                        <i class="pi pi-trash text-red-500" />
                      </button>
                    </div>                    
                  </Popover>
                </div>
                <img :src="IconPerson" alt="icono" class="size-40 w-full" />
              </template>
              <template #title>{{ user.name }}</template>
              <template #subtitle>{{ user.rol }}</template>
              <template #content>
                <p class="m-0">{{ user.email }}</p>
              </template>
            </Card>
          </div>
        </div>
      </template>

      <template #footer>
        <Paginator 
          :totalRecords="paginate.totalRecords" 
          :rows="paginate.limit" 
          :first="paginate.first"
          :rowsPerPageOptions="[10, 20, 30]" 
          @page="changePaginator($event)" />
      </template>
    </Card>
  </div>

  <Toast :title="toast.title" :message="toast.message" :type="toast.type" :focusOnShow="false" />

  <FormCreateEditUser :visible="toggleCreateEditUser" @update:visible="toggleCreateEditUser = $event"
    @isSaved="listarUsuarios" :isNewUser="false"/>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.feedback-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  min-height: 200px;
  color: #6b7280;
}
</style>