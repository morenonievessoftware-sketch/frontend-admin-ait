<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

interface Material {
    id: string
    titulo: string
    tipo: string
    contenido: string
    created_at: string
}

const authStore = useAuthStore()
const toast = useToast()
const materials = ref<Material[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const materialSeleccionado = ref<Material | null>(null)

onMounted(() => {
    cargarMateriales()
})

const cargarMateriales = async () => {
    if (!authStore.user?.id) return

    loading.value = true
    try {
        const response = await api.get(`/materiales/user/${authStore.user.id}`)
        materials.value = response.data
    } catch (error) {
        console.error('Error al cargar materiales:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los materiales', life: 3000 })
    } finally {
        loading.value = false
    }
}

const verMaterial = (material: Material) => {
    materialSeleccionado.value = material
    dialogVisible.value = true
}

const eliminarMaterial = async (material: Material) => {
    if (!confirm(`¿Estás seguro de eliminar "${material.titulo}"?`)) return

    try {
        await api.delete(`/materiales/${material.id}`)
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Material eliminado correctamente', life: 3000 })
        cargarMateriales()
    } catch (error) {
        console.error('Error al eliminar material:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el material', life: 3000 })
    }
}

const copiarContenido = async (contenido: string) => {
    try {
        await navigator.clipboard.writeText(contenido)
        toast.add({ severity: 'success', summary: 'Copiado', detail: 'Contenido copiado al portapapeles', life: 2000 })
    } catch (error) {
        console.error('Error al copiar:', error)
    }
}

const descargarDocx = async (material: Material) => {
    try {
        toast.add({ severity: 'info', summary: 'Generando', detail: 'Generando documento Word...', life: 2000 })

        const response = await api.get(`/materiales/${material.id}/export/docx`, {
            responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${material.titulo.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.docx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        toast.add({ severity: 'success', summary: 'Descargado', detail: 'Documento Word descargado correctamente', life: 2000 })
    } catch (error) {
        console.error('Error al descargar DOCX:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el documento', life: 3000 })
    }
}

const descargarPdf = async (material: Material) => {
    try {
        toast.add({ severity: 'info', summary: 'Generando', detail: 'Generando documento PDF...', life: 2000 })

        const response = await api.get(`/materiales/${material.id}/export/pdf`, {
            responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${material.titulo.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        toast.add({ severity: 'success', summary: 'Descargado', detail: 'Documento PDF descargado correctamente', life: 2000 })
    } catch (error) {
        console.error('Error al descargar PDF:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el documento', life: 3000 })
    }
}

const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
        examen: 'Examen',
        planificacion: 'Planificación',
        taller: 'Taller',
        guia: 'Guía',
        diapositivas: 'Diapositivas',
        simplificado: 'Texto Simplificado',
        apa: 'Referencia APA'
    }
    return tipos[tipo] || tipo
}

const getTipoColor = (tipo: string) => {
    const colores: Record<string, string> = {
        examen: '#3B82F6',
        planificacion: '#10B981',
        taller: '#F59E0B',
        guia: '#8B5CF6',
        diapositivas: '#EC4899',
        simplificado: '#06B6D4',
        apa: '#EF4444'
    }
    return colores[tipo] || '#6B7280'
}
</script>

<template>
    <div>
        <Toast />
        <Card>
            <template #header>
                <div class="card-header">
                    <h2>Mis Materiales</h2>
                    <Button
                        label="Generar Nuevo"
                        icon="pi pi-plus"
                        @click="$router.push('/herramientas')"
                    />
                </div>
            </template>
            <template #content>
                <DataTable
                    :value="materials"
                    :loading="loading"
                    paginator
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    stripedRows
                    responsiveLayout="scroll"
                    emptyMessage="No tienes materiales generados. ¡Crea uno desde Herramientas IA!"
                >
                    <Column field="titulo" header="Título" sortable>
                        <template #body="{ data }">
                            <span class="font-semibold">{{ data.titulo }}</span>
                        </template>
                    </Column>
                    <Column field="tipo" header="Tipo" sortable>
                        <template #body="{ data }">
                            <span
                                class="tipo-badge"
                                :style="{ backgroundColor: getTipoColor(data.tipo) + '20', color: getTipoColor(data.tipo) }"
                            >
                                {{ getTipoLabel(data.tipo) }}
                            </span>
                        </template>
                    </Column>
                    <Column field="created_at" header="Fecha" sortable>
                        <template #body="{ data }">
                            {{ formatearFecha(data.created_at) }}
                        </template>
                    </Column>
                    <Column header="Acciones" style="width: 260px">
                        <template #body="{ data }">
                            <div class="actions">
                                <Button
                                    icon="pi pi-eye"
                                    text
                                    rounded
                                    severity="info"
                                    @click="verMaterial(data)"
                                    v-tooltip="'Ver'"
                                />
                                <Button
                                    icon="pi pi-file-word"
                                    text
                                    rounded
                                    severity="info"
                                    @click="descargarDocx(data)"
                                    v-tooltip="'Descargar Word'"
                                />
                                <Button
                                    icon="pi pi-file-pdf"
                                    text
                                    rounded
                                    severity="danger"
                                    @click="descargarPdf(data)"
                                    v-tooltip="'Descargar PDF'"
                                />
                                <Button
                                    icon="pi pi-copy"
                                    text
                                    rounded
                                    severity="secondary"
                                    @click="copiarContenido(data.contenido)"
                                    v-tooltip="'Copiar'"
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
            </template>
        </Card>

        <!-- Dialog para ver material -->
        <Dialog
            v-model:visible="dialogVisible"
            :header="materialSeleccionado?.titulo"
            :style="{ width: '700px', maxHeight: '80vh' }"
            modal
        >
            <div v-if="materialSeleccionado" class="material-content">
                <div class="material-meta">
                    <span
                        class="tipo-badge"
                        :style="{
                            backgroundColor: getTipoColor(materialSeleccionado.tipo) + '20',
                            color: getTipoColor(materialSeleccionado.tipo)
                        }"
                    >
                        {{ getTipoLabel(materialSeleccionado.tipo) }}
                    </span>
                    <span class="fecha">{{ formatearFecha(materialSeleccionado.created_at) }}</span>
                </div>
                <pre class="contenido">{{ materialSeleccionado.contenido }}</pre>
            </div>

            <template #footer>
                <div class="dialog-footer">
                    <div class="export-buttons">
                        <Button
                            label="Word"
                            icon="pi pi-file-word"
                            severity="info"
                            outlined
                            @click="descargarDocx(materialSeleccionado!)"
                        />
                        <Button
                            label="PDF"
                            icon="pi pi-file-pdf"
                            severity="danger"
                            outlined
                            @click="descargarPdf(materialSeleccionado!)"
                        />
                    </div>
                    <div class="action-buttons">
                        <Button
                            label="Copiar"
                            icon="pi pi-copy"
                            severity="secondary"
                            outlined
                            @click="copiarContenido(materialSeleccionado?.contenido || '')"
                        />
                        <Button label="Cerrar" @click="dialogVisible = false" />
                    </div>
                </div>
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

.font-semibold {
    font-weight: 600;
}

.tipo-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.material-content {
    max-height: 60vh;
    overflow-y: auto;
}

.material-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

.fecha {
    font-size: 0.875rem;
    color: #6b7280;
}

.contenido {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #374151;
    margin: 0;
}

.dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 1rem;
}

.export-buttons {
    display: flex;
    gap: 0.5rem;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}
</style>
