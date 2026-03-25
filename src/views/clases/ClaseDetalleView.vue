<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import {
    NECESIDADES_EDUCATIVAS_OPTIONS,
    MODALIDAD_OPTIONS,
    type Modalidad,
    type NecesidadEducativa
} from '../../types'

interface Material {
    id: string
    title: string
    type: string
    content: string
    createdAt: string
}

interface Clase {
    id: string
    nombre: string
    descripcion: string
    materia: string
    grado: string
    estado: string
    modalidad?: Modalidad
    necesidadesPIAR?: NecesidadEducativa[]
    createdAt: string
    materiales: Material[]
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const clase = ref<Clase | null>(null)
const loading = ref(true)
const materialSeleccionado = ref<Material | null>(null)
const dialogVisible = ref(false)

const claseId = computed(() => route.params.id as string)

const opcionesGrado: Record<string, string> = {
    'grado_0': 'Transicion (Preescolar)',
    'grado_1': 'Grado 1° Primaria',
    'grado_2': 'Grado 2° Primaria',
    'grado_3': 'Grado 3° Primaria',
    'grado_4': 'Grado 4° Primaria',
    'grado_5': 'Grado 5° Primaria',
    'grado_6': 'Grado 6° Secundaria',
    'grado_7': 'Grado 7° Secundaria',
    'grado_8': 'Grado 8° Secundaria',
    'grado_9': 'Grado 9° Secundaria',
    'grado_10': 'Grado 10° Bachillerato',
    'grado_11': 'Grado 11° Bachillerato',
    'universitario': 'Universitario'
}

onMounted(() => {
    cargarClase()
})

const cargarClase = async () => {
    loading.value = true
    try {
        const response = await api.get(`/clases/${claseId.value}/materiales`)
        clase.value = response.data
    } catch (error) {
        console.error('Error al cargar clase:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la clase', life: 3000 })
        router.push('/clases')
    } finally {
        loading.value = false
    }
}

const formatearGrado = (grado: string) => {
    return opcionesGrado[grado] || grado
}

const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getTipoSeverity = (tipo: string) => {
    const severities: Record<string, string> = {
        'examen': 'danger',
        'taller': 'warn',
        'guia': 'info',
        'ppt': 'success',
        'ai-generated': 'secondary'
    }
    return severities[tipo] || 'info'
}

const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
        'examen': 'Examen',
        'taller': 'Taller',
        'guia': 'Guia',
        'ppt': 'Diapositivas',
        'ai-generated': 'IA'
    }
    return labels[tipo] || tipo
}

const formatearModalidad = (modalidad?: Modalidad) => {
    const found = MODALIDAD_OPTIONS.find(m => m.value === modalidad)
    return found ? found.label : 'Presencial'
}

const formatearNecesidad = (necesidad: NecesidadEducativa) => {
    const found = NECESIDADES_EDUCATIVAS_OPTIONS.find(n => n.value === necesidad)
    return found ? found.label : necesidad
}

const tieneInclusionPIAR = computed(() => {
    return clase.value?.necesidadesPIAR && clase.value.necesidadesPIAR.length > 0
})

const verMaterial = (material: Material) => {
    materialSeleccionado.value = material
    dialogVisible.value = true
}

const irAGenerar = () => {
    router.push(`/clases/${claseId.value}/generar`)
}

const volver = () => {
    router.push('/clases')
}

const copiarContenido = async () => {
    if (!materialSeleccionado.value) return
    try {
        await navigator.clipboard.writeText(materialSeleccionado.value.content)
        toast.add({ severity: 'success', summary: 'Copiado', detail: 'Contenido copiado al portapapeles', life: 2000 })
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo copiar', life: 2000 })
    }
}

const eliminarMaterial = async (material: Material) => {
    if (!confirm(`¿Eliminar el material "${material.title}"?`)) return

    try {
        await api.delete(`/clases/${claseId.value}/materiales/${material.id}`)
        toast.add({ severity: 'success', summary: 'Exito', detail: 'Material eliminado', life: 3000 })
        cargarClase()
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar', life: 3000 })
    }
}
</script>

<template>
    <div class="clase-detalle">
        <Toast />

        <div v-if="loading" class="loading-state">
            <ProgressSpinner />
            <p>Cargando clase...</p>
        </div>

        <template v-else-if="clase">
            <!-- Header -->
            <div class="header-section">
                <Button icon="pi pi-arrow-left" text @click="volver" class="back-btn" />
                <div class="header-info">
                    <h1>{{ clase.nombre }}</h1>
                    <div class="meta-info">
                        <Tag :value="clase.materia" severity="info" />
                        <Tag :value="formatearGrado(clase.grado)" severity="secondary" />
                        <span class="fecha">Creada: {{ formatearFecha(clase.createdAt) }}</span>
                    </div>
                </div>
                <Button
                    label="Generar contenido"
                    icon="pi pi-sparkles"
                    @click="irAGenerar"
                    class="generar-btn"
                />
            </div>

            <!-- Descripcion -->
            <Card v-if="clase.descripcion" class="descripcion-card">
                <template #content>
                    <p>{{ clase.descripcion }}</p>
                </template>
            </Card>

            <!-- Inclusion Educativa -->
            <Card class="inclusion-card">
                <template #content>
                    <div class="inclusion-section">
                        <div class="inclusion-header">
                            <i class="pi pi-heart"></i>
                            <span>Inclusion Educativa</span>
                        </div>
                        <div class="inclusion-content">
                            <div class="inclusion-item">
                                <span class="inclusion-label">Modalidad:</span>
                                <Tag :value="formatearModalidad(clase.modalidad)" severity="info" />
                            </div>
                            <div class="inclusion-item">
                                <span class="inclusion-label">DUA:</span>
                                <Tag value="Activo" severity="success" v-tooltip="'Diseno Universal para el Aprendizaje aplicado automaticamente'" />
                            </div>
                            <div class="inclusion-item" v-if="tieneInclusionPIAR">
                                <span class="inclusion-label">PIAR:</span>
                                <div class="piar-tags">
                                    <Tag
                                        v-for="necesidad in clase.necesidadesPIAR"
                                        :key="necesidad"
                                        :value="formatearNecesidad(necesidad)"
                                        severity="warn"
                                    />
                                </div>
                            </div>
                            <div class="inclusion-item" v-else>
                                <span class="inclusion-label">PIAR:</span>
                                <span class="no-piar">Sin ajustes adicionales</span>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Materiales -->
            <Card class="materiales-card">
                <template #header>
                    <div class="card-header">
                        <h3>Materiales generados ({{ clase.materiales?.length || 0 }})</h3>
                    </div>
                </template>
                <template #content>
                    <DataTable
                        v-if="clase.materiales?.length"
                        :value="clase.materiales"
                        paginator
                        :rows="10"
                        stripedRows
                        responsiveLayout="scroll"
                    >
                        <Column field="title" header="Titulo" sortable>
                            <template #body="{ data }">
                                <span class="font-semibold">{{ data.title }}</span>
                            </template>
                        </Column>
                        <Column field="type" header="Tipo" sortable>
                            <template #body="{ data }">
                                <Tag :value="getTipoLabel(data.type)" :severity="getTipoSeverity(data.type)" />
                            </template>
                        </Column>
                        <Column field="createdAt" header="Fecha" sortable>
                            <template #body="{ data }">
                                {{ formatearFecha(data.createdAt) }}
                            </template>
                        </Column>
                        <Column header="Acciones" style="width: 150px">
                            <template #body="{ data }">
                                <div class="actions">
                                    <Button
                                        icon="pi pi-eye"
                                        text
                                        rounded
                                        severity="info"
                                        @click="verMaterial(data)"
                                        v-tooltip="'Ver contenido'"
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        text
                                        rounded
                                        severity="danger"
                                        @click="eliminarMaterial(data)"
                                        v-tooltip="'Eliminar'"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>

                    <div v-else class="empty-state">
                        <i class="pi pi-inbox"></i>
                        <p>No hay materiales generados para esta clase</p>
                        <Button label="Generar primer material" icon="pi pi-sparkles" @click="irAGenerar" />
                    </div>
                </template>
            </Card>
        </template>

        <!-- Dialog para ver material -->
        <Dialog
            v-model:visible="dialogVisible"
            :header="materialSeleccionado?.title"
            :style="{ width: '800px', maxWidth: '95vw' }"
            modal
            maximizable
        >
            <div class="material-content">
                <pre>{{ materialSeleccionado?.content }}</pre>
            </div>
            <template #footer>
                <Button label="Copiar" icon="pi pi-copy" severity="secondary" outlined @click="copiarContenido" />
                <Button label="Cerrar" @click="dialogVisible = false" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.clase-detalle {
    padding: 1rem;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #6b7280;
}

.header-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.back-btn {
    color: #6b7280;
}

.header-info {
    flex: 1;
}

.header-info h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
}

.meta-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.fecha {
    font-size: 0.875rem;
    color: #6b7280;
}

.generar-btn {
    flex-shrink: 0;
}

.descripcion-card {
    margin-bottom: 1.5rem;
}

.descripcion-card p {
    margin: 0;
    color: #4b5563;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
}

.actions {
    display: flex;
    gap: 0.25rem;
}

.font-semibold {
    font-weight: 600;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem;
    color: #9ca3af;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.empty-state p {
    margin: 0 0 1.5rem 0;
}

.material-content {
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
}

.material-content pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    font-size: 0.9rem;
    line-height: 1.6;
    color: #374151;
}

/* Estilos para seccion de inclusion */
.inclusion-card {
    margin-bottom: 1.5rem;
}

.inclusion-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.inclusion-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #1f2937;
}

.inclusion-header i {
    color: #ec4899;
}

.inclusion-content {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.inclusion-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.inclusion-label {
    font-size: 0.875rem;
    color: #6b7280;
}

.piar-tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.no-piar {
    font-size: 0.875rem;
    color: #9ca3af;
    font-style: italic;
}
</style>