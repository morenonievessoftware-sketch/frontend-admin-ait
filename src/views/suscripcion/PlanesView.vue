<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getPlanesActivos } from '../../services/planes'
import { getUsageStatus } from '../../services/pagos'
import type { Plan, UsageStatus } from '../../types'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'

const router = useRouter()
const planes = ref<Plan[]>([])
const usageStatus = ref<UsageStatus | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const formatPrice = (precio: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio)
}

const getDurationLabel = (duration: string) => {
  return duration === 'monthly' ? 'mes' : 'año'
}

const currentPlanId = computed(() => {
  // TODO: Obtener el plan actual del usuario desde la suscripcion
  return null
})

const selectPlan = (plan: Plan) => {
  router.push({
    name: 'checkout',
    params: { planId: plan.id }
  })
}

onMounted(async () => {
  try {
    isLoading.value = true
    const [planesData, statusData] = await Promise.all([
      getPlanesActivos(),
      getUsageStatus()
    ])
    planes.value = planesData
    usageStatus.value = statusData
  } catch (err) {
    console.error('Error cargando datos:', err)
    error.value = 'Error al cargar los planes'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="planes-container">
    <!-- Estado de uso actual -->
    <Card v-if="usageStatus" class="mb-6">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-chart-bar text-primary"></i>
          Tu uso actual
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Plan actual</p>
            <p class="font-semibold text-lg">{{ usageStatus.plan }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Consultas IA este mes</p>
            <p class="font-semibold text-lg">
              {{ usageStatus.usage.current }} / {{ usageStatus.usage.limit }}
            </p>
            <ProgressBar
              :value="usageStatus.usage.percentage"
              :showValue="false"
              class="mt-2"
              :class="{ 'p-progressbar-danger': usageStatus.usage.percentage >= 90 }"
            />
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Consultas restantes</p>
            <p class="font-semibold text-lg" :class="usageStatus.usage.remaining === 0 ? 'text-red-500' : 'text-green-600'">
              {{ usageStatus.usage.remaining }}
            </p>
          </div>
        </div>
        <p v-if="usageStatus.message" class="mt-4 text-sm text-amber-600">
          <i class="pi pi-info-circle mr-1"></i>
          {{ usageStatus.message }}
        </p>
      </template>
    </Card>

    <!-- Titulo -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Elige tu plan</h1>
      <p class="text-gray-600">Selecciona el plan que mejor se adapte a tus necesidades</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
      <p class="text-red-500">{{ error }}</p>
      <Button label="Reintentar" @click="$router.go(0)" class="mt-4" />
    </div>

    <!-- Planes -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="plan in planes"
        :key="plan.id"
        class="plan-card"
        :class="{ 'plan-card--current': currentPlanId === plan.id }"
      >
        <template #header>
          <div class="plan-header">
            <Tag v-if="currentPlanId === plan.id" value="Plan actual" severity="success" />
            <h3 class="plan-name">{{ plan.nombre }}</h3>
            <div class="plan-price">
              <span class="price-amount">{{ formatPrice(plan.precio) }}</span>
              <span class="price-period">/ {{ getDurationLabel(plan.duration) }}</span>
            </div>
          </div>
        </template>

        <template #content>
          <p v-if="plan.descripcion" class="text-gray-600 mb-4">
            {{ plan.descripcion}}
          </p>

          <ul class="plan-features">
            <li>
              <i class="pi pi-check text-green-500 mr-2"></i>
              <span>{{ plan.aiQueriesLimit }} </span> Consultas de IA por mes
            </li>            
            <li v-for="descrip in plan.descripciones" :key="descrip.id">
              <i class="pi pi-check text-green-500 mr-2"></i>
              {{ descrip.descripcion }}
            </li>
          </ul>
        </template>

        <template #footer>
          <Button
            :label="currentPlanId === plan.id ? 'Plan actual' : 'Seleccionar'"
            :disabled="currentPlanId === plan.id"
            @click="selectPlan(plan)"
            class="w-full"
            :severity="currentPlanId === plan.id ? 'secondary' : 'primary'"
          />
        </template>
      </Card>
    </div>

    <!-- Sin planes -->
    <div v-if="!isLoading && !error && planes.length === 0" class="text-center py-12">
      <i class="pi pi-inbox text-4xl text-gray-400 mb-4"></i>
      <p class="text-gray-500">No hay planes disponibles en este momento</p>
    </div>
  </div>
</template>

<style scoped>
.planes-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.plan-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.plan-card--current {
  border: 2px solid var(--primary-color);
}

.plan-header {
  padding: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 6px 6px 0 0;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0.5rem 0;
}

.plan-price {
  margin-top: 0.5rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary-color);
}

.price-period {
  font-size: 1rem;
  color: #6b7280;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.plan-features li:last-child {
  border-bottom: none;
}

:deep(.p-progressbar-danger .p-progressbar-value) {
  background: #ef4444;
}
</style>