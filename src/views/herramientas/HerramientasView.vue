<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'

const router = useRouter()

interface Herramienta {
    id: string
    titulo: string
    descripcion: string
    icono: string
    color: string
    ruta: string
}

const herramientas = ref<Herramienta[]>([
    {
        id: 'examen',
        titulo: 'Crear Examen',
        descripcion: 'Genera exámenes personalizados con preguntas de opción múltiple, verdadero/falso y desarrollo.',
        icono: 'pi pi-file-edit',
        color: '#3B82F6',
        ruta: '/herramientas/examen'
    },
    {
        id: 'icfes',
        titulo: 'Evaluación ICFES',
        descripcion: 'Crea evaluaciones estilo pruebas Saber/ICFES con preguntas por competencias.',
        icono: 'pi pi-check-square',
        color: '#0EA5E9',
        ruta: '/herramientas/icfes'
    },
    {
        id: 'planificacion',
        titulo: 'Planificación',
        descripcion: 'Crea planificaciones de clase estructuradas con objetivos, actividades y evaluaciones.',
        icono: 'pi pi-calendar',
        color: '#10B981',
        ruta: '/herramientas/planificacion'
    },
    {
        id: 'taller',
        titulo: 'Generar Taller',
        descripcion: 'Diseña talleres prácticos con ejercicios y actividades para tus estudiantes.',
        icono: 'pi pi-wrench',
        color: '#F59E0B',
        ruta: '/herramientas/taller'
    },
    {
        id: 'guia',
        titulo: 'Guía de Clase',
        descripcion: 'Genera guías de estudio y material de apoyo para organizar tus clases.',
        icono: 'pi pi-book',
        color: '#8B5CF6',
        ruta: '/herramientas/guia'
    },
    {
        id: 'diapositivas',
        titulo: 'Diapositivas',
        descripcion: 'Crea esquemas y contenido para presentaciones educativas.',
        icono: 'pi pi-desktop',
        color: '#EC4899',
        ruta: '/herramientas/diapositivas'
    },
    {
        id: 'explicar',
        titulo: 'Explicar Tema',
        descripcion: 'Genera explicaciones claras de cualquier tema adaptadas al grado escolar.',
        icono: 'pi pi-comments',
        color: '#14B8A6',
        ruta: '/herramientas/explicar'
    },
    {
        id: 'simplificar',
        titulo: 'Simplificar Texto',
        descripcion: 'Transforma textos complejos en versiones más fáciles de entender para tus estudiantes.',
        icono: 'pi pi-align-left',
        color: '#06B6D4',
        ruta: '/herramientas/simplificar'
    },
    {
        id: 'resumen',
        titulo: 'Resumir Texto',
        descripcion: 'Genera resúmenes claros y organizados de textos extensos.',
        icono: 'pi pi-list',
        color: '#6366F1',
        ruta: '/herramientas/resumen'
    },
    {
        id: 'rubrica',
        titulo: 'Crear Rúbrica',
        descripcion: 'Genera rúbricas de evaluación con criterios claros y niveles de desempeño.',
        icono: 'pi pi-table',
        color: '#F97316',
        ruta: '/herramientas/rubrica'
    },
    {
        id: 'apa',
        titulo: 'Formato APA',
        descripcion: 'Genera referencias bibliográficas y citas en formato APA automáticamente.',
        icono: 'pi pi-bookmark',
        color: '#EF4444',
        ruta: '/herramientas/apa'
    }
])

const irAHerramienta = (ruta: string) => {
    router.push(ruta)
}
</script>

<template>
    <div class="herramientas-container">
        <div class="header-section">
            <h1>Herramientas Educativas</h1>
            <p>Selecciona una herramienta para generar contenido educativo con IA</p>
        </div>

        <div class="herramientas-grid">
            <Card
                v-for="herramienta in herramientas"
                :key="herramienta.id"
                class="herramienta-card"
                @click="irAHerramienta(herramienta.ruta)"
            >
                <template #content>
                    <div class="card-content">
                        <div
                            class="icon-container"
                            :style="{ backgroundColor: herramienta.color + '15', color: herramienta.color }"
                        >
                            <i :class="herramienta.icono"></i>
                        </div>
                        <h3>{{ herramienta.titulo }}</h3>
                        <p>{{ herramienta.descripcion }}</p>
                        <div class="card-action">
                            <span>Comenzar</span>
                            <i class="pi pi-arrow-right"></i>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.herramientas-container {
    padding: 1rem;
}

.header-section {
    margin-bottom: 2rem;
}

.header-section h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
}

.header-section p {
    color: #6b7280;
    margin: 0;
}

.herramientas-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
}

.herramienta-card {
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid #e5e7eb;
}

.herramienta-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.card-content {
    text-align: center;
    padding: 1rem;
}

.icon-container {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem auto;
}

.icon-container i {
    font-size: 1.75rem;
}

.card-content h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
}

.card-content p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0 0 1rem 0;
    line-height: 1.5;
}

.card-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #2563eb;
    font-weight: 500;
    font-size: 0.875rem;
}

.card-action i {
    transition: transform 0.2s;
}

.herramienta-card:hover .card-action i {
    transform: translateX(4px);
}

@media (max-width: 640px) {
    .herramientas-grid {
        grid-template-columns: 1fr;
    }
}
</style>
