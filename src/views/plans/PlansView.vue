<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import api from '../../services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import TagsInput from '../../components/common/TagsInput.vue'

interface PlanItem {
  id?: string
  nombre: string
  precio: number
  descripciones: descripcionesPlan[]
  estado: number
}

interface descripcionesPlan {
  id: string,
  descripcion: string
  idPlan: string
}

const ListPlans = ref<PlanItem[]>([])
const isLoading = ref(false)
const isModalVisible = ref(false)
const isEditing = ref(false)
const editingPlanId = ref<string | null>(null)

// Form fields
const nombre = ref('')
const precio = ref(0)
const descripciones = ref<string[]>([])
const estado = ref(1)

const modalTitle = computed(() => isEditing.value ? 'Editar Plan' : 'Nuevo Plan')

const resetForm = () => {
  nombre.value = ''
  precio.value = 0
  descripciones.value = []
  estado.value = 1
  isEditing.value = false
  editingPlanId.value = null
}

const openCreateModal = () => {
  resetForm()
  isModalVisible.value = true
}

const openEditModal = (plan: PlanItem) => {
  isEditing.value = true
  editingPlanId.value = plan.id || null
  nombre.value = plan.nombre
  precio.value = plan.precio
  // descripciones.value = Array.isArray(plan.descripciones)
  //   ? [...plan.descripciones]
  //   : []
  descripciones.value = Array.isArray(plan.descripciones)
    ? plan.descripciones.map(a=>a.descripcion)
    : []
  console.log(descripciones.value, "log descripciones"); 
  estado.value = plan.estado
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
  resetForm()
}

const getListPlanes = async () => {
  isLoading.value = true
  try {
    const { data: planes } = await api.get('/planes')
    ListPlans.value = planes
  } catch (error) {
    console.error('No es posible listar los planes', error)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    const payload = {
      nombre: nombre.value,
      precio: precio.value,
      descripciones: descripciones.value,
      estado: estado.value
    }

    if (isEditing.value && editingPlanId.value) {
      await api.put(`/planes/${editingPlanId.value}`, payload)
    } else {
      await api.post('/planes', payload)
    }

    await getListPlanes()
    closeModal()
  } catch (error) {
    console.error('No es posible guardar el plan', error)
  }
}

const deletePlan = async (plan: PlanItem) => {
  if (!plan.id) return

  if (confirm(`¿Estás seguro de eliminar el plan "${plan.nombre}"?`)) {
    try {
      await api.delete(`/planes/${plan.id}`)
      await getListPlanes()
    } catch (error) {
      console.error('No es posible eliminar el plan', error)
    }
  }
}

onMounted(() => {
  getListPlanes()
})
</script>

<template>
  <div>
    <Card>
      <template #header>
        <div class="card-header">
          <h2>Planes de Suscripción</h2>
          <Button label="Nuevo Plan" @click="openCreateModal" icon="pi pi-plus" />
        </div>
      </template>
      <template #content>
        <DataTable :value="ListPlans" stripedRows :loading="isLoading">
          <Column field="nombre" header="Nombre" sortable />
          <Column field="precio" header="Precio" sortable>
            <template #body="{ data }">
              {{ new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(data.precio) }}
            </template>
          </Column>
          <Column field="descripciones" header="Características">
            <template #body="{ data }">
              <div class="flex flex-wrap gap-1">
                <Tag
                  v-for="(item, index) in (data.descripciones || [])"
                  :key="index"
                  :value="item.descripcion"
                  severity="info"
                  class="text-xs"
                />
                <span v-if="!data.descripciones?.length" class="text-gray-400 text-sm">
                  Sin características
                </span>
              </div>
            </template>
          </Column>
          <Column field="estado" header="Estado" sortable>
            <template #body="{ data }">
              <div class="text-xs font-semibold">
                <span
                  v-if="data.estado == 1"
                  class="bg-green-100 text-green-800 rounded-full p-1.5 px-2.5"
                >
                  Activo
                </span>
                <span
                  v-else
                  class="bg-red-100 text-red-800 rounded-full p-1.5 px-2.5"
                >
                  Inactivo
                </span>
              </div>
            </template>
          </Column>
          <Column header="Acciones">
            <template #body="{ data }">
              <div class="actions">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="secondary"
                  @click="openEditModal(data)"
                  v-tooltip.top="'Editar'"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  @click="deletePlan(data)"
                  v-tooltip.top="'Eliminar'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>

  <Dialog
    v-model:visible="isModalVisible"
    maximizable
    modal
    :header="modalTitle"
    :draggable="false"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    @hide="resetForm"
  >
    <form @submit.prevent="handleSubmit">
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div>
            <label for="nombre" class="block text-sm font-medium text-gray-900 mb-2">
              Nombre del Plan
            </label>
            <input
              type="text"
              v-model="nombre"
              id="nombre"
              required
              class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
              placeholder="Ej: Plan Premium"
            />
          </div>

          <div>
            <label for="precio" class="block text-sm font-medium text-gray-900 mb-2">
              Precio (COP)
            </label>
            <input
              type="number"
              v-model="precio"
              id="precio"
              required
              min="0"
              class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
              placeholder="Ej: 50000"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Características del Plan
            </label>
            <TagsInput
              v-model="descripciones"
              placeholder="Escribe una característica y presiona Enter o +"
            />
          </div>

          <div>
            <label for="estado" class="block text-sm font-medium text-gray-900 mb-2">
              Estado
            </label>
            <select
              v-model="estado"
              id="estado"
              class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border border-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
            >
              <option :value="1">Activo</option>
              <option :value="0">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-8 flex items-center justify-end gap-x-4">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          outlined
          @click="closeModal"
        />
        <Button
          type="submit"
          :label="isEditing ? 'Actualizar' : 'Guardar'"
          icon="pi pi-save"
        />
      </div>
    </form>
  </Dialog>
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
</style>
