<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'
import Panel from 'primevue/panel'
import { useToast } from 'primevue/usetoast'
import {
    MODALIDAD_OPTIONS,
    NECESIDADES_EDUCATIVAS_OPTIONS,
    type Modalidad,
    type NecesidadEducativa
} from '../../types'

interface Clase {
    id: string
    nombre: string
    descripcion: string
    materia: string
    grado: string
    estado?: string
    modalidad?: Modalidad
    necesidadesPIAR?: NecesidadEducativa[]
    created_at: string
    _count?: {
        materiales: number
    }
}

// Opciones de grado estandarizadas
const opcionesGrado = [
    { label: 'Transición (Preescolar)', value: 'grado_0' },
    { label: 'Grado 1° Primaria', value: 'grado_1' },
    { label: 'Grado 2° Primaria', value: 'grado_2' },
    { label: 'Grado 3° Primaria', value: 'grado_3' },
    { label: 'Grado 4° Primaria', value: 'grado_4' },
    { label: 'Grado 5° Primaria', value: 'grado_5' },
    { label: 'Grado 6° Secundaria', value: 'grado_6' },
    { label: 'Grado 7° Secundaria', value: 'grado_7' },
    { label: 'Grado 8° Secundaria', value: 'grado_8' },
    { label: 'Grado 9° Secundaria', value: 'grado_9' },
    { label: 'Grado 10° Bachillerato', value: 'grado_10' },
    { label: 'Grado 11° Bachillerato', value: 'grado_11' },
    { label: 'Universitario', value: 'universitario' }
]

const router = useRouter()
const toast = useToast()
const clases = ref<Clase[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref<'crear' | 'editar'>('crear')
const claseSeleccionada = ref<Clase | null>(null)

const formulario = ref({
    nombre: '',
    descripcion: '',
    materia: '',
    grado: '',
    modalidad: 'presencial' as Modalidad,
    necesidadesPIAR: [] as NecesidadEducativa[]
})

onMounted(() => {
    cargarClases()
})

const cargarClases = async () => {
    loading.value = true
    try {
        const response = await api.get('/clases')
        clases.value = response.data
    } catch (error) {
        console.error('Error al cargar clases:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las clases', life: 3000 })
    } finally {
        loading.value = false
    }
}

const abrirDialogoCrear = () => {
    dialogMode.value = 'crear'
    formulario.value = {
        nombre: '',
        descripcion: '',
        materia: '',
        grado: '',
        modalidad: 'presencial',
        necesidadesPIAR: []
    }
    dialogVisible.value = true
}

const abrirDialogoEditar = (clase: Clase) => {
    dialogMode.value = 'editar'
    claseSeleccionada.value = clase
    formulario.value = {
        nombre: clase.nombre,
        descripcion: clase.descripcion,
        materia: clase.materia,
        grado: clase.grado,
        modalidad: clase.modalidad || 'presencial',
        necesidadesPIAR: clase.necesidadesPIAR || []
    }
    dialogVisible.value = true
}

const guardarClase = async () => {
    if (!formulario.value.nombre || !formulario.value.materia || !formulario.value.grado) {
        toast.add({ severity: 'warn', summary: 'Atención', detail: 'Nombre, materia y grado son requeridos', life: 3000 })
        return
    }

    try {
        if (dialogMode.value === 'crear') {
            await api.post('/clases', formulario.value)
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Clase creada correctamente', life: 3000 })
        } else if (claseSeleccionada.value) {
            await api.put(`/clases/${claseSeleccionada.value.id}`, formulario.value)
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Clase actualizada correctamente', life: 3000 })
        }
        dialogVisible.value = false
        cargarClases()
    } catch (error) {
        console.error('Error al guardar clase:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la clase', life: 3000 })
    }
}

const eliminarClase = async (clase: Clase) => {
    if (!confirm(`¿Estás seguro de eliminar la clase "${clase.nombre}"?`)) return

    try {
        await api.delete(`/clases/${clase.id}`)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Clase eliminada correctamente', life: 3000 })
        cargarClases()
    } catch (error) {
        console.error('Error al eliminar clase:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la clase', life: 3000 })
    }
}

const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const formatearGrado = (grado: string) => {
    const found = opcionesGrado.find(g => g.value === grado)
    return found ? found.label : grado
}

const verDetalle = (clase: Clase) => {
    router.push(`/clases/${clase.id}`)
}

const generarContenido = (clase: Clase) => {
    router.push(`/clases/${clase.id}/generar`)
}

const getEstadoSeverity = (estado?: string) => {
    switch (estado) {
        case 'activa': return 'success'
        case 'archivada': return 'secondary'
        case 'pausada': return 'warn'
        default: return 'info'
    }
}
</script>

<template>
    <div>
        <Toast />
        <Card>
            <template #header>
                <div class="card-header">
                    <h2>Mis Clases</h2>
                    <Button label="Nueva Clase" icon="pi pi-plus" @click="abrirDialogoCrear" />
                </div>
            </template>
            <template #content>
                <DataTable
                    :value="clases"
                    :loading="loading"
                    paginator
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 20]"
                    stripedRows
                    responsiveLayout="scroll"
                    emptyMessage="No tienes clases registradas"
                >
                    <Column field="nombre" header="Nombre" sortable>
                        <template #body="{ data }">
                            <div class="nombre-cell">
                                <span class="font-semibold">{{ data.nombre }}</span>
                                <Tag v-if="data.estado" :severity="getEstadoSeverity(data.estado)" :value="data.estado" class="estado-tag" />
                            </div>
                        </template>
                    </Column>
                    <Column field="materia" header="Materia" sortable />
                    <Column field="grado" header="Grado" sortable>
                        <template #body="{ data }">
                            {{ formatearGrado(data.grado) }}
                        </template>
                    </Column>
                    <Column header="Materiales">
                        <template #body="{ data }">
                            <Tag :value="`${data._count?.materiales || 0} materiales`" severity="info" />
                        </template>
                    </Column>
                    <Column header="Inclusion" style="width: 120px">
                        <template #body="{ data }">
                            <div class="inclusion-tags">
                                <Tag
                                    v-if="data.necesidadesPIAR?.length"
                                    :value="`PIAR (${data.necesidadesPIAR.length})`"
                                    severity="warn"
                                    v-tooltip="'Tiene ajustes PIAR configurados'"
                                />
                                <Tag
                                    v-else
                                    value="DUA"
                                    severity="success"
                                    v-tooltip="'Contenido con DUA automatico'"
                                />
                            </div>
                        </template>
                    </Column>
                    <Column field="created_at" header="Creada" sortable>
                        <template #body="{ data }">
                            {{ formatearFecha(data.created_at) }}
                        </template>
                    </Column>
                    <Column header="Acciones" style="width: 220px">
                        <template #body="{ data }">
                            <div class="actions">
                                <Button
                                    icon="pi pi-eye"
                                    text
                                    rounded
                                    severity="info"
                                    @click="verDetalle(data)"
                                    v-tooltip="'Ver detalles'"
                                />
                                <Button
                                    icon="pi pi-sparkles"
                                    text
                                    rounded
                                    severity="success"
                                    @click="generarContenido(data)"
                                    v-tooltip="'Generar contenido'"
                                />
                                <Button
                                    icon="pi pi-pencil"
                                    text
                                    rounded
                                    severity="secondary"
                                    @click="abrirDialogoEditar(data)"
                                    v-tooltip="'Editar'"
                                />
                                <Button
                                    icon="pi pi-trash"
                                    text
                                    rounded
                                    severity="danger"
                                    @click="eliminarClase(data)"
                                    v-tooltip="'Eliminar'"
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <!-- Dialog para crear/editar -->
        <Dialog
            v-model:visible="dialogVisible"
            :draggable=false
            :header="dialogMode === 'crear' ? 'Nueva Clase' : 'Editar Clase'"
            :style="{ width: '500px' }"
            modal
        >
            <div class="dialog-content">
                <div class="form-field">
                    <label for="nombre">Nombre de la clase *</label>
                    <InputText
                        id="nombre"
                        v-model="formulario.nombre"
                        placeholder="Ej: Matemáticas 3ro A"
                        class="w-full"
                    />
                </div>

                <div class="form-field">
                    <label for="materia">Materia *</label>
                    <InputText
                        id="materia"
                        v-model="formulario.materia"
                        placeholder="Ej: Matemáticas"
                        class="w-full"
                    />
                </div>

                <div class="form-field">
                    <label for="grado">Grado/Nivel *</label>
                    <Select
                        id="grado"
                        v-model="formulario.grado"
                        :options="opcionesGrado"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecciona el grado"
                        class="w-full"
                    />
                </div>

                <div class="form-field">
                    <label for="descripcion">Descripcion</label>
                    <Textarea
                        id="descripcion"
                        v-model="formulario.descripcion"
                        placeholder="Describe tu clase..."
                        rows="3"
                        class="w-full"
                    />
                </div>

                <!-- Seccion de Inclusion Educativa -->
                <Panel header="Inclusion Educativa (DUA y PIAR)" toggleable collapsed class="inclusion-panel">
                    <div class="inclusion-info">
                        <i class="pi pi-info-circle"></i>
                        <span>El contenido generado se adaptara automaticamente segun estos ajustes</span>
                    </div>

                    <div class="form-field">
                        <label for="modalidad">Modalidad de clase</label>
                        <Select
                            id="modalidad"
                            v-model="formulario.modalidad"
                            :options="MODALIDAD_OPTIONS"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecciona la modalidad"
                            class="w-full"
                        />
                    </div>

                    <div class="form-field">
                        <label for="necesidadesPIAR">Necesidades educativas especiales (PIAR)</label>
                        <MultiSelect
                            id="necesidadesPIAR"
                            v-model="formulario.necesidadesPIAR"
                            :options="NECESIDADES_EDUCATIVAS_OPTIONS"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecciona si aplica..."
                            display="chip"
                            :maxSelectedLabels="3"
                            class="w-full"
                        >
                            <template #option="{ option }">
                                <div class="necesidad-option">
                                    <span class="necesidad-label">{{ option.label }}</span>
                                    <small class="necesidad-desc">{{ option.descripcion }}</small>
                                </div>
                            </template>
                        </MultiSelect>
                        <small class="field-help">Los materiales incluiran ajustes para estas necesidades</small>
                    </div>
                </Panel>
            </div>

            <template #footer>
                <Button label="Cancelar" severity="secondary" outlined @click="dialogVisible = false" />
                <Button :label="dialogMode === 'crear' ? 'Crear' : 'Guardar'" @click="guardarClase" />
            </template>
        </Dialog>
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
    gap: 0.25rem;
}

.dialog-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1rem 0;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-field label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.font-semibold {
    font-weight: 600;
}

.text-sm {
    font-size: 0.875rem;
}

.text-gray-600 {
    color: #4b5563;
}

.nombre-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.estado-tag {
    font-size: 0.7rem;
}

/* Estilos para seccion de inclusion */
.inclusion-panel {
    margin-top: 0.5rem;
}

.inclusion-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #eff6ff;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: #1e40af;
}

.inclusion-info i {
    font-size: 1rem;
}

.necesidad-option {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}

.necesidad-label {
    font-weight: 500;
}

.necesidad-desc {
    color: #6b7280;
    font-size: 0.75rem;
}

.field-help {
    color: #6b7280;
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

.inclusion-tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}
</style>
