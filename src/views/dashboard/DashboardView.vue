<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import api from '../../services/api'
import Card from 'primevue/card'
import Button from 'primevue/button'

const router = useRouter()
const authStore = useAuthStore()

interface Stats {
    totalClases: number
    totalMateriales: number
    materialesEsteMes: number
    totalUsuarios?: number
    isAdmin: boolean
}

const stats = ref<Stats>({
    totalClases: 0,
    totalMateriales: 0,
    materialesEsteMes: 0,
    isAdmin: false
})

const loading = ref(false)

const herramientasRapidas = [
    { id: 'examen', titulo: 'Crear Examen', icono: 'pi pi-file-edit', color: '#3B82F6' },
    { id: 'planificacion', titulo: 'Planificación', icono: 'pi pi-calendar', color: '#10B981' },
    { id: 'taller', titulo: 'Generar Taller', icono: 'pi pi-wrench', color: '#F59E0B' },
    { id: 'simplificar', titulo: 'Simplificar Texto', icono: 'pi pi-align-left', color: '#06B6D4' }
]

onMounted(async () => {
    await cargarEstadisticas()
})

const cargarEstadisticas = async () => {
    if (!authStore.user?.id) return

    loading.value = true
    try {
        const response = await api.get('/dashboard/stats')
        const data = response.data

        stats.value = {
            totalClases: data.totalClases || 0,
            totalMateriales: data.totalMateriales || 0,
            materialesEsteMes: data.materialesEsteMes || 0,
            totalUsuarios: data.totalUsuarios,
            isAdmin: data.isAdmin || false
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error)
    } finally {
        loading.value = false
    }
}

const irAHerramienta = (id: string) => {
    router.push(`/herramientas/${id}`)
}
</script>

<template>
    <div class="dashboard-container">
        <!-- Bienvenida -->
        <Card class="welcome-card">
            <template #content>
                <div class="welcome-content">
                    <div>
                        <h1>¡Hola, {{ authStore.user?.nombre || 'Docente' }}!</h1>
                        <p>Bienvenido a AIdeaTeach. ¿Qué quieres crear hoy?</p>
                    </div>
                    <Button
                        label="Ir a Herramientas"
                        icon="pi pi-sparkles"
                        @click="router.push('/herramientas')"
                    />
                </div>
            </template>
        </Card>

        <!-- Estadísticas -->
        <div class="stats-grid">
            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon" style="background: #3B82F620; color: #3B82F6;">
                            <i class="pi pi-book"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats.totalClases }}</span>
                            <span class="stat-label">Clases</span>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon" style="background: #10B98120; color: #10B981;">
                            <i class="pi pi-file"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats.totalMateriales }}</span>
                            <span class="stat-label">Materiales Generados</span>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon" style="background: #8B5CF620; color: #8B5CF6;">
                            <i class="pi pi-chart-line"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats.materialesEsteMes }}</span>
                            <span class="stat-label">Este Mes</span>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Solo visible para admins -->
            <Card v-if="stats.isAdmin" class="stat-card">
                <template #content>
                    <div class="stat-content">
                        <div class="stat-icon" style="background: #F5920B20; color: #F59E0B;">
                            <i class="pi pi-users"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value">{{ stats.totalUsuarios }}</span>
                            <span class="stat-label">Total Usuarios</span>
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Acceso Rápido -->
        <Card class="quick-access-card">
            <template #header>
                <div class="card-header">
                    <h3>Acceso Rápido</h3>
                    <Button
                        label="Ver todas"
                        text
                        size="small"
                        @click="router.push('/herramientas')"
                    />
                </div>
            </template>
            <template #content>
                <div class="quick-tools-grid">
                    <div
                        v-for="herramienta in herramientasRapidas"
                        :key="herramienta.id"
                        class="quick-tool"
                        @click="irAHerramienta(herramienta.id)"
                    >
                        <div
                            class="tool-icon"
                            :style="{ backgroundColor: herramienta.color + '15', color: herramienta.color }"
                        >
                            <i :class="herramienta.icono"></i>
                        </div>
                        <span>{{ herramienta.titulo }}</span>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Sección de ayuda -->
        <div class="help-grid">
            <Card class="help-card">
                <template #content>
                    <div class="help-content">
                        <i class="pi pi-lightbulb"></i>
                        <div>
                            <h4>Tip del día</h4>
                            <p>Usa "Simplificar Texto" para adaptar contenido complejo al nivel de tus estudiantes.</p>
                        </div>
                    </div>
                </template>
            </Card>

            <Card class="help-card">
                <template #content>
                    <div class="help-content">
                        <i class="pi pi-question-circle"></i>
                        <div>
                            <h4>¿Necesitas ayuda?</h4>
                            <p>Organiza tu contenido creando clases y asignándoles materiales generados.</p>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
.dashboard-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.welcome-card {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
}

.welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

.welcome-content h1 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
}

.welcome-content p {
    margin: 0;
    opacity: 0.9;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
}

.stat-label {
    font-size: 0.875rem;
    color: #6b7280;
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

.quick-tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.quick-tool {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
    border-radius: 12px;
    background: #f9fafb;
    cursor: pointer;
    transition: all 0.2s;
}

.quick-tool:hover {
    background: #f3f4f6;
    transform: translateY(-2px);
}

.tool-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.quick-tool span {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    text-align: center;
}

.help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}

.help-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
}

.help-content {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.help-content > i {
    font-size: 1.5rem;
    color: #2563eb;
    margin-top: 0.25rem;
}

.help-content h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
}

.help-content p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
    line-height: 1.5;
}

@media (max-width: 640px) {
    .welcome-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .quick-tools-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
