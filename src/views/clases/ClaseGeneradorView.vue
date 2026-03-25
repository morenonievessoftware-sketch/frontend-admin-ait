<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import {
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
    modalidad?: Modalidad
    necesidadesPIAR?: NecesidadEducativa[]
}

interface TipoContenido {
    id: string
    nombre: string
    descripcion: string
    icono: string
    campos: Campo[]
}

interface Campo {
    nombre: string
    etiqueta: string
    tipo: 'text' | 'textarea' | 'number' | 'select'
    placeholder?: string
    requerido: boolean
    opciones?: { label: string; value: string }[]
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const clase = ref<Clase | null>(null)
const loading = ref(true)
const generando = ref(false)
const tipoSeleccionado = ref<string>('')
const formulario = ref<Record<string, any>>({})
const resultado = ref('')
const resultadoHtml = ref('')

const claseId = computed(() => route.params.id as string)

const tiposContenido: TipoContenido[] = [
    {
        id: 'examen',
        nombre: 'Examen',
        descripcion: 'Genera un examen con preguntas personalizadas',
        icono: 'pi pi-file-edit',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema del examen', tipo: 'text', placeholder: 'Ej: Ecuaciones cuadraticas', requerido: true },
            { nombre: 'cantidad', etiqueta: 'Numero de preguntas', tipo: 'number', requerido: true },
            { nombre: 'tipoPreguntas', etiqueta: 'Tipo de preguntas', tipo: 'select', requerido: false, opciones: [
                { label: 'Opcion multiple', value: 'opcion_multiple' },
                { label: 'Verdadero/Falso', value: 'verdadero_falso' },
                { label: 'Desarrollo', value: 'desarrollo' },
                { label: 'Mixto', value: 'mixto' }
            ]},
            { nombre: 'instrucciones', etiqueta: 'Instrucciones adicionales', tipo: 'textarea', placeholder: 'Opcional...', requerido: false }
        ]
    },
    {
        id: 'icfes',
        nombre: 'Evaluacion ICFES',
        descripcion: 'Preguntas estilo pruebas Saber/ICFES',
        icono: 'pi pi-check-square',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema a evaluar', tipo: 'text', placeholder: 'Ej: Comprension lectora', requerido: true },
            { nombre: 'cantidad', etiqueta: 'Numero de preguntas', tipo: 'number', requerido: true },
            { nombre: 'instrucciones', etiqueta: 'Contexto adicional', tipo: 'textarea', placeholder: 'Opcional...', requerido: false }
        ]
    },
    {
        id: 'planificacion',
        nombre: 'Planificacion',
        descripcion: 'Planificacion de clase estructurada',
        icono: 'pi pi-calendar',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema de la clase', tipo: 'text', placeholder: 'Ej: Introduccion a la fotosintesis', requerido: true },
            { nombre: 'duracion', etiqueta: 'Duracion (minutos)', tipo: 'text', requerido: false },
            { nombre: 'objetivos', etiqueta: 'Objetivos de aprendizaje', tipo: 'textarea', placeholder: 'Que el estudiante comprenda...', requerido: false }
        ]
    },
    {
        id: 'taller',
        nombre: 'Taller',
        descripcion: 'Taller practico con ejercicios',
        icono: 'pi pi-wrench',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema del taller', tipo: 'text', placeholder: 'Ej: Programacion basica', requerido: true },
            { nombre: 'cantidad', etiqueta: 'Numero de ejercicios', tipo: 'number', requerido: true },
            { nombre: 'instrucciones', etiqueta: 'Descripcion', tipo: 'textarea', placeholder: 'Habilidades a desarrollar...', requerido: false }
        ]
    },
    {
        id: 'guia',
        nombre: 'Guia de Clase',
        descripcion: 'Guia de estudio para estudiantes',
        icono: 'pi pi-book',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema de la guia', tipo: 'text', placeholder: 'Ej: La Revolucion Industrial', requerido: true },
            { nombre: 'instrucciones', etiqueta: 'Contenido a cubrir', tipo: 'textarea', placeholder: 'Puntos principales...', requerido: false }
        ]
    },
    {
        id: 'diapositivas',
        nombre: 'Diapositivas',
        descripcion: 'Contenido para presentacion',
        icono: 'pi pi-desktop',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema', tipo: 'text', placeholder: 'Ej: El sistema solar', requerido: true },
            { nombre: 'cantidad', etiqueta: 'Numero de diapositivas', tipo: 'number', requerido: true }
        ]
    },
    {
        id: 'explicar',
        nombre: 'Explicar Tema',
        descripcion: 'Explicacion adaptada al nivel',
        icono: 'pi pi-comments',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema a explicar', tipo: 'text', placeholder: 'Ej: La mitosis celular', requerido: true },
            { nombre: 'instrucciones', etiqueta: 'Contexto adicional', tipo: 'textarea', placeholder: 'Los estudiantes ya conocen...', requerido: false }
        ]
    },
    {
        id: 'resumen',
        nombre: 'Resumir Texto',
        descripcion: 'Resume textos extensos',
        icono: 'pi pi-list',
        campos: [
            { nombre: 'texto', etiqueta: 'Texto a resumir', tipo: 'textarea', placeholder: 'Pega el texto aqui...', requerido: true },
            { nombre: 'tema', etiqueta: 'Titulo del tema', tipo: 'text', placeholder: 'Ej: Resumen de capitulo 5', requerido: true }
        ]
    },
    {
        id: 'rubrica',
        nombre: 'Rubrica',
        descripcion: 'Rubrica de evaluacion',
        icono: 'pi pi-table',
        campos: [
            { nombre: 'tema', etiqueta: 'Actividad a evaluar', tipo: 'text', placeholder: 'Ej: Exposicion oral', requerido: true },
            { nombre: 'instrucciones', etiqueta: 'Criterios principales', tipo: 'textarea', placeholder: 'Contenido, presentacion...', requerido: false }
        ]
    }
]

const tipoActual = computed(() => tiposContenido.find(t => t.id === tipoSeleccionado.value))

// Computed para informacion de inclusion
const tieneInclusionPIAR = computed(() => {
    return clase.value?.necesidadesPIAR && clase.value.necesidadesPIAR.length > 0
})

const necesidadesFormateadas = computed(() => {
    if (!clase.value?.necesidadesPIAR) return []
    return clase.value.necesidadesPIAR.map(n => {
        const found = NECESIDADES_EDUCATIVAS_OPTIONS.find(opt => opt.value === n)
        return found ? found.label : n
    })
})

const opcionesGrado: Record<string, string> = {
    'grado_0': 'Transicion',
    'grado_1': '1° Primaria',
    'grado_2': '2° Primaria',
    'grado_3': '3° Primaria',
    'grado_4': '4° Primaria',
    'grado_5': '5° Primaria',
    'grado_6': '6° Secundaria',
    'grado_7': '7° Secundaria',
    'grado_8': '8° Secundaria',
    'grado_9': '9° Secundaria',
    'grado_10': '10° Bachillerato',
    'grado_11': '11° Bachillerato',
    'universitario': 'Universitario'
}

onMounted(() => {
    cargarClase()
})

const cargarClase = async () => {
    loading.value = true
    try {
        const response = await api.get(`/clases/${claseId.value}`)
        clase.value = response.data
    } catch (error) {
        console.error('Error al cargar clase:', error)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la clase', life: 3000 })
        router.push('/clases')
    } finally {
        loading.value = false
    }
}

const seleccionarTipo = (tipo: string) => {
    tipoSeleccionado.value = tipo
    formulario.value = {}
    resultado.value = ''
    resultadoHtml.value = ''

    // Inicializar campos
    const config = tiposContenido.find(t => t.id === tipo)
    if (config) {
        config.campos.forEach(campo => {
            formulario.value[campo.nombre] = campo.tipo === 'number' ? null : ''
        })
    }
}

const parseMarkdown = (text: string): string => {
    return text
        .replace(/^\*\*(.+?)\*\*$/gm, '<h2 class="md-h2">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^\s*\+ (.+)$/gm, '<li class="md-li-sub">$1</li>')
        .replace(/^\* (.+)$/gm, '<li class="md-li">$1</li>')
        .replace(/\n\n/g, '</p><p class="md-p">')
        .replace(/^(?!<)(.+)$/gm, '<p class="md-p">$1</p>')
        .replace(/<p class="md-p"><\/p>/g, '')
        .replace(/<p class="md-p">(<h[123])/g, '$1')
        .replace(/(<\/h[123]>)<\/p>/g, '$1')
        .replace(/<p class="md-p">(<li)/g, '$1')
        .replace(/(<\/li>)<\/p>/g, '$1')
}

const generar = async () => {
    if (!tipoSeleccionado.value || !clase.value) return

    // Validar campos requeridos
    const config = tipoActual.value
    if (config) {
        for (const campo of config.campos) {
            if (campo.requerido && !formulario.value[campo.nombre]) {
                toast.add({ severity: 'warn', summary: 'Atencion', detail: `El campo "${campo.etiqueta}" es requerido`, life: 3000 })
                return
            }
        }
    }

    generando.value = true
    resultado.value = ''

    try {
        const response = await api.post(`/clases/${claseId.value}/generar/${tipoSeleccionado.value}`, formulario.value)
        const contenido = response.data.material?.content || response.data.contenido || ''
        resultado.value = contenido
        resultadoHtml.value = parseMarkdown(contenido)
        toast.add({ severity: 'success', summary: 'Generado', detail: 'Contenido generado y guardado en la clase', life: 3000 })
    } catch (error: any) {
        console.error('Error al generar:', error)
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'No se pudo generar el contenido',
            life: 3000
        })
    } finally {
        generando.value = false
    }
}

const volverAClases = () => {
    router.push('/clases')
}

const copiarResultado = async () => {
    try {
        await navigator.clipboard.writeText(resultado.value)
        toast.add({ severity: 'success', summary: 'Copiado', detail: 'Contenido copiado al portapapeles', life: 2000 })
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo copiar', life: 2000 })
    }
}

const limpiar = () => {
    resultado.value = ''
    resultadoHtml.value = ''
    if (tipoActual.value) {
        tipoActual.value.campos.forEach(campo => {
            formulario.value[campo.nombre] = campo.tipo === 'number' ? null : ''
        })
    }
}
</script>

<template>
    <div class="clase-generador">
        <Toast />

        <div v-if="loading" class="loading-state">
            <ProgressSpinner />
            <p>Cargando...</p>
        </div>

        <template v-else-if="clase">
            <!-- Header -->
            <div class="header-section">
                <Button icon="pi pi-arrow-left" text @click="volverAClases" class="back-btn" />
                <div class="header-info">
                    <h1>Generar contenido</h1>
                    <div class="clase-info">
                        <Tag :value="clase.nombre" severity="info" />
                        <Tag :value="clase.materia" severity="secondary" />
                        <Tag :value="opcionesGrado[clase.grado] || clase.grado" />
                    </div>
                </div>
            </div>

            <!-- Banner de Inclusion -->
            <div class="inclusion-banner">
                <div class="inclusion-icon">
                    <i class="pi pi-heart"></i>
                </div>
                <div class="inclusion-message">
                    <strong>Contenido Inclusivo</strong>
                    <span>El material generado incluira automaticamente principios DUA (Diseno Universal para el Aprendizaje)</span>
                    <div v-if="tieneInclusionPIAR" class="piar-info">
                        <span>Ajustes PIAR:</span>
                        <Tag
                            v-for="necesidad in necesidadesFormateadas"
                            :key="necesidad"
                            :value="necesidad"
                            severity="warn"
                            class="piar-tag"
                        />
                    </div>
                </div>
            </div>

            <div class="content-layout">
                <!-- Selector de tipo -->
                <Card class="tipos-card">
                    <template #header>
                        <div class="card-header">
                            <h3>Tipo de contenido</h3>
                        </div>
                    </template>
                    <template #content>
                        <div class="tipos-grid">
                            <div
                                v-for="tipo in tiposContenido"
                                :key="tipo.id"
                                class="tipo-item"
                                :class="{ 'selected': tipoSeleccionado === tipo.id }"
                                @click="seleccionarTipo(tipo.id)"
                            >
                                <i :class="tipo.icono"></i>
                                <span>{{ tipo.nombre }}</span>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Formulario y resultado -->
                <div class="main-content" v-if="tipoSeleccionado">
                    <Card class="form-card">
                        <template #header>
                            <div class="card-header">
                                <h3>{{ tipoActual?.nombre }}</h3>
                                <small>{{ tipoActual?.descripcion }}</small>
                            </div>
                        </template>
                        <template #content>
                            <form @submit.prevent="generar" class="form-content">
                                <div
                                    v-for="campo in tipoActual?.campos"
                                    :key="campo.nombre"
                                    class="form-field"
                                >
                                    <label :for="campo.nombre">
                                        {{ campo.etiqueta }}
                                        <span v-if="campo.requerido" class="required">*</span>
                                    </label>

                                    <InputText
                                        v-if="campo.tipo === 'text'"
                                        :id="campo.nombre"
                                        v-model="formulario[campo.nombre]"
                                        :placeholder="campo.placeholder"
                                        class="w-full"
                                    />

                                    <Textarea
                                        v-else-if="campo.tipo === 'textarea'"
                                        :id="campo.nombre"
                                        v-model="formulario[campo.nombre]"
                                        :placeholder="campo.placeholder"
                                        rows="3"
                                        class="w-full"
                                    />

                                    <InputNumber
                                        v-else-if="campo.tipo === 'number'"
                                        :id="campo.nombre"
                                        v-model="formulario[campo.nombre]"
                                        :min="1"
                                        :max="50"
                                        class="w-full"
                                    />

                                    <Select
                                        v-else-if="campo.tipo === 'select'"
                                        :id="campo.nombre"
                                        v-model="formulario[campo.nombre]"
                                        :options="campo.opciones"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Seleccionar..."
                                        class="w-full"
                                    />
                                </div>

                                <div class="form-actions">
                                    <Button
                                        type="button"
                                        label="Limpiar"
                                        icon="pi pi-refresh"
                                        severity="secondary"
                                        outlined
                                        @click="limpiar"
                                    />
                                    <Button
                                        type="submit"
                                        label="Generar"
                                        icon="pi pi-sparkles"
                                        :loading="generando"
                                    />
                                </div>
                            </form>
                        </template>
                    </Card>

                    <Card class="result-card">
                        <template #header>
                            <div class="card-header">
                                <h3>Resultado</h3>
                                <Button
                                    v-if="resultado"
                                    icon="pi pi-copy"
                                    text
                                    rounded
                                    @click="copiarResultado"
                                    v-tooltip="'Copiar'"
                                />
                            </div>
                        </template>
                        <template #content>
                            <div v-if="generando" class="loading-state">
                                <ProgressSpinner style="width: 50px; height: 50px" />
                                <p>Generando contenido...</p>
                            </div>

                            <div v-else-if="resultado" class="result-content">
                                <div class="markdown-content" v-html="resultadoHtml"></div>
                            </div>

                            <div v-else class="empty-state">
                                <i class="pi pi-file-edit"></i>
                                <p>El contenido aparecera aqui</p>
                            </div>
                        </template>
                    </Card>
                </div>

                <div v-else class="placeholder-message">
                    <i class="pi pi-arrow-left"></i>
                    <p>Selecciona un tipo de contenido para comenzar</p>
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
.clase-generador {
    padding: 1rem;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #6b7280;
}

.header-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.back-btn {
    color: #6b7280;
}

.header-info h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
}

.clase-info {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.content-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.card-header {
    display: flex;
    flex-direction: column;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
}

.card-header small {
    color: #6b7280;
    margin-top: 0.25rem;
}

.tipos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
}

.tipo-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}

.tipo-item:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.tipo-item.selected {
    border-color: #3b82f6;
    background: #dbeafe;
}

.tipo-item i {
    font-size: 1.5rem;
    color: #3b82f6;
}

.tipo-item span {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    text-align: center;
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

.required {
    color: #ef4444;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #9ca3af;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.placeholder-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #9ca3af;
    background: #f9fafb;
    border-radius: 0.75rem;
}

.placeholder-message i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.result-content {
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    min-height: 300px;
    max-height: 500px;
    overflow-y: auto;
}

.markdown-content {
    font-size: 0.9rem;
    line-height: 1.7;
    color: #374151;
}

.markdown-content :deep(.md-h1) {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 1.5rem 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e5e7eb;
}

.markdown-content :deep(.md-h2) {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2563eb;
    margin: 1.25rem 0 0.75rem 0;
}

.markdown-content :deep(.md-h3) {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 1rem 0 0.5rem 0;
}

.markdown-content :deep(.md-p) {
    margin: 0.5rem 0;
}

.markdown-content :deep(.md-li) {
    margin: 0.35rem 0;
    padding-left: 1.25rem;
    position: relative;
    list-style: none;
}

.markdown-content :deep(.md-li)::before {
    content: "•";
    position: absolute;
    left: 0;
    color: #2563eb;
    font-weight: bold;
}

.markdown-content :deep(.md-li-sub) {
    margin: 0.25rem 0;
    padding-left: 2.5rem;
    position: relative;
    list-style: none;
    color: #4b5563;
}

.markdown-content :deep(.md-li-sub)::before {
    content: "circle";
    position: absolute;
    left: 1.25rem;
    color: #6b7280;
}

@media (max-width: 1024px) {
    .main-content {
        grid-template-columns: 1fr;
    }
}

/* Estilos para banner de inclusion */
.inclusion-banner {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, #fdf2f8 0%, #eff6ff 100%);
    border: 1px solid #fbcfe8;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
}

.inclusion-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: white;
    border-radius: 50%;
    flex-shrink: 0;
}

.inclusion-icon i {
    font-size: 1.25rem;
    color: #ec4899;
}

.inclusion-message {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.inclusion-message strong {
    color: #1f2937;
    font-size: 0.95rem;
}

.inclusion-message > span {
    color: #4b5563;
    font-size: 0.875rem;
}

.piar-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
}

.piar-info > span {
    font-size: 0.8rem;
    color: #6b7280;
}

.piar-tag {
    font-size: 0.75rem;
}
</style>