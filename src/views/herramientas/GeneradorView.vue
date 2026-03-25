<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

interface ConfigHerramienta {
    id: string
    titulo: string
    descripcion: string
    endpoint: string
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

// Opciones de grado estandarizadas para el sistema educativo colombiano
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

const configuraciones: Record<string, ConfigHerramienta> = {
    examen: {
        id: 'examen',
        titulo: 'Crear Examen',
        descripcion: 'Genera un examen personalizado para tus estudiantes',
        endpoint: '/educativo/examen',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema del examen', tipo: 'text', placeholder: 'Ej: Ecuaciones cuadráticas', requerido: true },
            { nombre: 'grado', etiqueta: 'Grado escolar', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'numPreguntas', etiqueta: 'Número de preguntas', tipo: 'number', requerido: true },
            { nombre: 'tipoPreguntas', etiqueta: 'Tipo de preguntas', tipo: 'select', requerido: true, opciones: [
                { label: 'Opción múltiple', value: 'opcion_multiple' },
                { label: 'Verdadero/Falso', value: 'verdadero_falso' },
                { label: 'Desarrollo', value: 'desarrollo' },
                { label: 'Mixto', value: 'mixto' }
            ]},
            { nombre: 'instrucciones', etiqueta: 'Instrucciones adicionales (opcional)', tipo: 'textarea', placeholder: 'Ej: Incluir ejercicios prácticos...', requerido: false }
        ]
    },
    icfes: {
        id: 'icfes',
        titulo: 'Evaluación Tipo ICFES',
        descripcion: 'Genera preguntas estilo pruebas Saber/ICFES con competencias',
        endpoint: '/educativo/icfes',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema a evaluar', tipo: 'text', placeholder: 'Ej: Comprensión lectora - Textos argumentativos', requerido: true },
            { nombre: 'grado', etiqueta: 'Grado escolar', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'numPreguntas', etiqueta: 'Número de preguntas', tipo: 'number', requerido: true },
            { nombre: 'competencia', etiqueta: 'Competencia a evaluar', tipo: 'select', requerido: false, opciones: [
                { label: 'Interpretativa', value: 'interpretativa' },
                { label: 'Argumentativa', value: 'argumentativa' },
                { label: 'Propositiva', value: 'propositiva' },
                { label: 'Mixta', value: 'mixta' }
            ]},
            { nombre: 'instrucciones', etiqueta: 'Contexto adicional (opcional)', tipo: 'textarea', placeholder: 'Ej: Enfocarse en análisis de gráficas...', requerido: false }
        ]
    },
    planificacion: {
        id: 'planificacion',
        titulo: 'Crear Planificación',
        descripcion: 'Genera una planificación de clase estructurada',
        endpoint: '/educativo/planificacion',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema de la clase', tipo: 'text', placeholder: 'Ej: Introducción a la fotosíntesis', requerido: true },
            { nombre: 'grado', etiqueta: 'Grado escolar', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'duracion', etiqueta: 'Duración (minutos)', tipo: 'number', requerido: true },
            { nombre: 'objetivos', etiqueta: 'Objetivos de aprendizaje', tipo: 'textarea', placeholder: 'Ej: Que el estudiante comprenda el proceso de...', requerido: true }
        ]
    },
    taller: {
        id: 'taller',
        titulo: 'Generar Taller',
        descripcion: 'Crea un taller práctico para tus estudiantes',
        endpoint: '/educativo/taller',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema del taller', tipo: 'text', placeholder: 'Ej: Programación básica en Python', requerido: true },
            { nombre: 'grado', etiqueta: 'Grado escolar', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'numEjercicios', etiqueta: 'Número de ejercicios', tipo: 'number', requerido: true },
            { nombre: 'descripcion', etiqueta: 'Descripción del taller', tipo: 'textarea', placeholder: 'Describe qué habilidades quieres desarrollar...', requerido: false }
        ]
    },
    guia: {
        id: 'guia',
        titulo: 'Crear Guía de Clase',
        descripcion: 'Genera una guía de estudio para tus estudiantes',
        endpoint: '/educativo/guia',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema de la guía', tipo: 'text', placeholder: 'Ej: La Revolución Industrial', requerido: true },
            { nombre: 'grado', etiqueta: 'Grado escolar', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'contenido', etiqueta: 'Contenido a cubrir', tipo: 'textarea', placeholder: 'Lista los puntos principales que debe cubrir la guía...', requerido: true }
        ]
    },
    diapositivas: {
        id: 'diapositivas',
        titulo: 'Crear Diapositivas',
        descripcion: 'Genera el contenido para una presentación educativa',
        endpoint: '/educativo/diapositivas',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema de la presentación', tipo: 'text', placeholder: 'Ej: El sistema solar', requerido: true },
            { nombre: 'grado', etiqueta: 'Grado escolar', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'numDiapositivas', etiqueta: 'Número de diapositivas', tipo: 'number', requerido: true },
            { nombre: 'estilo', etiqueta: 'Estilo de presentación', tipo: 'select', requerido: false, opciones: [
                { label: 'Formal', value: 'formal' },
                { label: 'Dinámico', value: 'dinamico' },
                { label: 'Visual', value: 'visual' }
            ]}
        ]
    },
    simplificar: {
        id: 'simplificar',
        titulo: 'Simplificar Texto',
        descripcion: 'Transforma textos complejos en versiones más accesibles',
        endpoint: '/educativo/simplificar',
        campos: [
            { nombre: 'texto', etiqueta: 'Texto a simplificar', tipo: 'textarea', placeholder: 'Pega aquí el texto que quieres simplificar...', requerido: true },
            { nombre: 'grado', etiqueta: 'Nivel de comprensión objetivo', tipo: 'select', requerido: true, opciones: opcionesGrado }
        ]
    },
    resumen: {
        id: 'resumen',
        titulo: 'Resumir Texto',
        descripcion: 'Genera resúmenes claros y organizados de textos extensos',
        endpoint: '/educativo/resumen',
        campos: [
            { nombre: 'texto', etiqueta: 'Texto a resumir', tipo: 'textarea', placeholder: 'Pega aquí el texto que quieres resumir...', requerido: true },
            { nombre: 'grado', etiqueta: 'Nivel del resumen', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'extension', etiqueta: 'Extensión del resumen', tipo: 'select', requerido: false, opciones: [
                { label: 'Breve (1 párrafo)', value: 'breve' },
                { label: 'Medio (2-3 párrafos)', value: 'medio' },
                { label: 'Extenso (detallado)', value: 'extenso' }
            ]}
        ]
    },
    rubrica: {
        id: 'rubrica',
        titulo: 'Crear Rúbrica',
        descripcion: 'Genera rúbricas de evaluación con criterios claros',
        endpoint: '/educativo/rubrica',
        campos: [
            { nombre: 'tema', etiqueta: 'Actividad a evaluar', tipo: 'text', placeholder: 'Ej: Exposición oral sobre cambio climático', requerido: true },
            { nombre: 'grado', etiqueta: 'Grado escolar', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'criterios', etiqueta: 'Criterios principales', tipo: 'textarea', placeholder: 'Ej: Contenido, presentación, uso de recursos visuales...', requerido: true },
            { nombre: 'niveles', etiqueta: 'Niveles de desempeño', tipo: 'select', requerido: false, opciones: [
                { label: '3 niveles (Bajo, Medio, Alto)', value: '3' },
                { label: '4 niveles (Insuficiente a Excelente)', value: '4' },
                { label: '5 niveles (Muy bajo a Excelente)', value: '5' }
            ]}
        ]
    },
    explicar: {
        id: 'explicar',
        titulo: 'Explicar Tema',
        descripcion: 'Genera explicaciones adaptadas al nivel educativo',
        endpoint: '/educativo/explicar',
        campos: [
            { nombre: 'tema', etiqueta: 'Tema a explicar', tipo: 'text', placeholder: 'Ej: La mitosis celular', requerido: true },
            { nombre: 'grado', etiqueta: 'Grado escolar', tipo: 'select', requerido: true, opciones: opcionesGrado },
            { nombre: 'enfoque', etiqueta: 'Enfoque de la explicación', tipo: 'select', requerido: false, opciones: [
                { label: 'Conceptual (teoría)', value: 'conceptual' },
                { label: 'Práctico (ejemplos)', value: 'practico' },
                { label: 'Visual (analogías)', value: 'visual' },
                { label: 'Mixto', value: 'mixto' }
            ]},
            { nombre: 'contexto', etiqueta: 'Contexto adicional (opcional)', tipo: 'textarea', placeholder: 'Ej: Los estudiantes ya conocen la estructura celular...', requerido: false }
        ]
    },
    apa: {
        id: 'apa',
        titulo: 'Formato APA',
        descripcion: 'Genera referencias bibliográficas en formato APA',
        endpoint: '/educativo/apa',
        campos: [
            { nombre: 'tipoFuente', etiqueta: 'Tipo de fuente', tipo: 'select', requerido: true, opciones: [
                { label: 'Libro', value: 'libro' },
                { label: 'Artículo de revista', value: 'articulo' },
                { label: 'Página web', value: 'web' },
                { label: 'Tesis', value: 'tesis' }
            ]},
            { nombre: 'datos', etiqueta: 'Datos de la fuente', tipo: 'textarea', placeholder: 'Ingresa los datos disponibles: autor, título, año, editorial, URL, etc.', requerido: true }
        ]
    }
}

const herramientaId = computed(() => route.params.tipo as string)
const config = computed(() => configuraciones[herramientaId.value])

const formulario = ref<Record<string, any>>({})
const resultado = ref('')
const resultadoHtml = ref('')
const materialId = ref<string | null>(null)
const loading = ref(false)
const loadingExport = ref(false)
const error = ref('')

// Función simple para convertir markdown básico a HTML
const parseMarkdown = (text: string): string => {
    return text
        // Headers
        .replace(/^\*\*(.+?)\*\*$/gm, '<h2 class="md-h2">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Lists with +
        .replace(/^\s*\+ (.+)$/gm, '<li class="md-li-sub">$1</li>')
        // Lists
        .replace(/^\* (.+)$/gm, '<li class="md-li">$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p class="md-p">')
        // Wrap in paragraph
        .replace(/^(?!<)(.+)$/gm, '<p class="md-p">$1</p>')
        // Clean empty paragraphs
        .replace(/<p class="md-p"><\/p>/g, '')
        .replace(/<p class="md-p">(<h[123])/g, '$1')
        .replace(/(<\/h[123]>)<\/p>/g, '$1')
        .replace(/<p class="md-p">(<li)/g, '$1')
        .replace(/(<\/li>)<\/p>/g, '$1')
}

onMounted(() => {
    // Inicializar formulario
    if (config.value) {
        config.value.campos.forEach(campo => {
            formulario.value[campo.nombre] = campo.tipo === 'number' ? null : ''
        })
    }
})

const generar = async () => {
    if (!config.value) return

    // Validar campos requeridos
    for (const campo of config.value.campos) {
        if (campo.requerido && !formulario.value[campo.nombre]) {
            error.value = `El campo "${campo.etiqueta}" es requerido`
            return
        }
    }

    loading.value = true
    error.value = ''
    resultado.value = ''
    materialId.value = null

    try {
        const response = await api.post(config.value.endpoint, formulario.value)

        // Extraer el contenido de la estructura de respuesta del backend
        const contenido = response.data.material?.content
            || response.data.material?.contenido
            || response.data.contenido
            || response.data.resultado
            || response.data.content
            || (typeof response.data === 'string' ? response.data : '')

        // Guardar el ID del material para exportar
        materialId.value = response.data.material?.id || response.data.id || null

        resultado.value = contenido
        resultadoHtml.value = parseMarkdown(contenido)
    } catch (err: any) {
        error.value = err.response?.data?.error || 'Error al generar el contenido'
        console.error('Error:', err)
    } finally {
        loading.value = false
    }
}

const volver = () => {
    router.push('/herramientas')
}

const limpiar = () => {
    resultado.value = ''
    resultadoHtml.value = ''
    materialId.value = null
    error.value = ''
    if (config.value) {
        config.value.campos.forEach(campo => {
            formulario.value[campo.nombre] = campo.tipo === 'number' ? null : ''
        })
    }
}

const copiarResultado = async () => {
    try {
        await navigator.clipboard.writeText(resultado.value)
        toast.add({ severity: 'success', summary: 'Copiado', detail: 'Contenido copiado al portapapeles', life: 2000 })
    } catch (err) {
        console.error('Error al copiar:', err)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo copiar', life: 2000 })
    }
}

const descargarDocx = async () => {
    if (!materialId.value) {
        toast.add({ severity: 'warn', summary: 'Atención', detail: 'No hay material para exportar', life: 2000 })
        return
    }

    loadingExport.value = true
    toast.add({ severity: 'info', summary: 'Generando', detail: 'Generando documento Word...', life: 2000 })

    try {
        const response = await api.get(`/materiales/${materialId.value}/export/docx`, {
            responseType: 'blob'
        })

        const nombreArchivo = config.value?.titulo.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'documento'
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${nombreArchivo}.docx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        toast.add({ severity: 'success', summary: 'Descargado', detail: 'Documento Word descargado', life: 2000 })
    } catch (err) {
        console.error('Error al descargar DOCX:', err)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el documento', life: 3000 })
    } finally {
        loadingExport.value = false
    }
}

const descargarPdf = async () => {
    if (!materialId.value) {
        toast.add({ severity: 'warn', summary: 'Atención', detail: 'No hay material para exportar', life: 2000 })
        return
    }

    loadingExport.value = true
    toast.add({ severity: 'info', summary: 'Generando', detail: 'Generando documento PDF...', life: 2000 })

    try {
        const response = await api.get(`/materiales/${materialId.value}/export/pdf`, {
            responseType: 'blob'
        })

        const nombreArchivo = config.value?.titulo.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'documento'
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${nombreArchivo}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        toast.add({ severity: 'success', summary: 'Descargado', detail: 'Documento PDF descargado', life: 2000 })
    } catch (err) {
        console.error('Error al descargar PDF:', err)
        toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el documento', life: 3000 })
    } finally {
        loadingExport.value = false
    }
}
</script>

<template>
    <div class="generador-container">
        <Toast />
        <div class="header-section">
            <Button icon="pi pi-arrow-left" text @click="volver" class="back-btn" />
            <div>
                <h1>{{ config?.titulo }}</h1>
                <p>{{ config?.descripcion }}</p>
            </div>
        </div>

        <div class="content-grid">
            <!-- Formulario -->
            <Card class="form-card">
                <template #header>
                    <div class="card-header">
                        <h3>Configuración</h3>
                    </div>
                </template>
                <template #content>
                    <form @submit.prevent="generar" class="form-content">
                        <div
                            v-for="campo in config?.campos"
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
                                rows="4"
                                class="w-full"
                            />

                            <InputNumber
                                v-else-if="campo.tipo === 'number'"
                                :id="campo.nombre"
                                v-model="formulario[campo.nombre]"
                                :min="1"
                                :max="100"
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

                        <div v-if="error" class="error-message">
                            <i class="pi pi-exclamation-circle"></i>
                            {{ error }}
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
                                :loading="loading"
                            />
                        </div>
                    </form>
                </template>
            </Card>

            <!-- Resultado -->
            <Card class="result-card">
                <template #header>
                    <div class="card-header">
                        <h3>Resultado</h3>
                        <div v-if="resultado" class="result-actions">
                            <Button
                                icon="pi pi-file-word"
                                text
                                rounded
                                severity="info"
                                @click="descargarDocx"
                                :disabled="!materialId || loadingExport"
                                v-tooltip="'Descargar Word'"
                            />
                            <Button
                                icon="pi pi-file-pdf"
                                text
                                rounded
                                severity="danger"
                                @click="descargarPdf"
                                :disabled="!materialId || loadingExport"
                                v-tooltip="'Descargar PDF'"
                            />
                            <Button
                                icon="pi pi-copy"
                                text
                                rounded
                                @click="copiarResultado"
                                v-tooltip="'Copiar'"
                            />
                        </div>
                    </div>
                </template>
                <template #content>
                    <div v-if="loading" class="loading-state">
                        <ProgressSpinner style="width: 50px; height: 50px" />
                        <p>Generando contenido...</p>
                    </div>

                    <div v-else-if="resultado" class="result-content">
                        <div class="markdown-content" v-html="resultadoHtml"></div>
                    </div>

                    <div v-else class="empty-state">
                        <i class="pi pi-file-edit"></i>
                        <p>El contenido generado aparecerá aquí</p>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.generador-container {
    padding: 1rem;
}

.header-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.back-btn {
    color: #6b7280;
}

.header-section h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.header-section p {
    color: #6b7280;
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
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

.result-actions {
    display: flex;
    gap: 0.25rem;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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

.error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
    color: #dc2626;
    font-size: 0.875rem;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
}

.loading-state,
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

.loading-state p,
.empty-state p {
    margin: 0;
    font-size: 0.875rem;
}

.result-content {
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    min-height: 300px;
    max-height: 600px;
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
    content: "◦";
    position: absolute;
    left: 1.25rem;
    color: #6b7280;
}

.markdown-content :deep(strong) {
    font-weight: 600;
    color: #1f2937;
}

.markdown-content :deep(em) {
    font-style: italic;
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}
</style>
