<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verificarPago } from '../../services/pagos'
import type { Pago } from '../../types'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()

const pago = ref<Pago | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const verificationAttempts = ref(0)
const maxAttempts = 5

const reference = computed(() => route.query.ref as string)

const statusConfig = computed(() => {
  if (!pago.value) return null

  const configs: Record<string, { icon: string; color: string; title: string; message: string }> = {
    APPROVED: {
      icon: 'pi-check-circle',
      color: 'text-green-500',
      title: 'Pago exitoso',
      message: 'Tu suscripcion ha sido activada correctamente. Ya puedes disfrutar de todas las funciones de IA.'
    },
    PENDING: {
      icon: 'pi-clock',
      color: 'text-yellow-500',
      title: 'Pago pendiente',
      message: 'Tu pago esta siendo procesado. Te notificaremos cuando se complete.'
    },
    DECLINED: {
      icon: 'pi-times-circle',
      color: 'text-red-500',
      title: 'Pago rechazado',
      message: 'El pago no pudo ser procesado. Por favor, intenta con otro metodo de pago.'
    },
    VOIDED: {
      icon: 'pi-ban',
      color: 'text-gray-500',
      title: 'Pago anulado',
      message: 'Este pago ha sido anulado.'
    },
    ERROR: {
      icon: 'pi-exclamation-triangle',
      color: 'text-red-500',
      title: 'Error en el pago',
      message: 'Ocurrio un error procesando tu pago. Por favor, intenta nuevamente.'
    }
  }

  return configs[pago.value.estado] || configs.ERROR
})

const formatPrice = (monto: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(monto / 100) // El monto viene en centavos
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const verifyPayment = async () => {
  if (!reference.value) {
    error.value = 'Referencia de pago no encontrada'
    isLoading.value = false
    return
  }

  try {
    verificationAttempts.value++
    const response = await verificarPago(reference.value)
    pago.value = response.data.pago

    // Si el pago sigue pendiente y no hemos alcanzado el maximo de intentos,
    // volver a verificar en unos segundos
    if (pago.value.estado === 'PENDING' && verificationAttempts.value < maxAttempts) {
      setTimeout(verifyPayment, 3000)
    }
  } catch (err: any) {
    console.error('Error verificando pago:', err)
    error.value = err.response?.data?.message || 'Error al verificar el pago'
  } finally {
    isLoading.value = false
  }
}

const goToPlanes = () => {
  router.push({ name: 'planes' })
}

const goToDashboard = () => {
  router.push({ name: 'dashboard' })
}

const goToHerramientas = () => {
  router.push({ name: 'herramientas' })
}

onMounted(() => {
  verifyPayment()
})
</script>

<template>
  <div class="resultado-container">
    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
      <ProgressSpinner />
      <p class="mt-4 text-gray-600">Verificando estado del pago...</p>
      <p v-if="verificationAttempts > 1" class="text-sm text-gray-500 mt-2">
        Intento {{ verificationAttempts }} de {{ maxAttempts }}
      </p>
    </div>

    <!-- Error -->
    <div v-else-if="error && !pago" class="text-center py-16">
      <i class="pi pi-exclamation-triangle text-5xl text-red-500 mb-4"></i>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Error</h2>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <div class="flex justify-center gap-4">
        <Button label="Volver a planes" @click="goToPlanes" />
        <Button label="Ir al dashboard" @click="goToDashboard" severity="secondary" />
      </div>
    </div>

    <!-- Resultado -->
    <Card v-else-if="pago && statusConfig" class="max-w-xl mx-auto">
      <template #content>
        <div class="text-center py-6">
          <!-- Icono de estado -->
          <div class="mb-6">
            <i
              :class="['pi', statusConfig.icon, statusConfig.color]"
              style="font-size: 5rem;"
            ></i>
          </div>

          <!-- Titulo y mensaje -->
          <h1 class="text-2xl font-bold text-gray-900 mb-3">
            {{ statusConfig.title }}
          </h1>
          <p class="text-gray-600 mb-6">
            {{ statusConfig.message }}
          </p>

          <!-- Detalles del pago -->
          <div class="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <h3 class="font-semibold text-gray-900 mb-3">Detalles del pago</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Referencia:</span>
                <span class="font-mono">{{ pago.reference }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Monto:</span>
                <span class="font-semibold">{{ pago.montoFormateado || formatPrice(pago.monto) }}</span>
              </div>
              <div v-if="pago.metodoPago" class="flex justify-between">
                <span class="text-gray-500">Metodo:</span>
                <span>{{ pago.metodoPago }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Fecha:</span>
                <span>{{ formatDate(pago.completedAt || pago.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Estado:</span>
                <span
                  :class="{
                    'text-green-600': pago.estado === 'APPROVED',
                    'text-yellow-600': pago.estado === 'PENDING',
                    'text-red-600': ['DECLINED', 'ERROR', 'VOIDED'].includes(pago.estado)
                  }"
                  class="font-semibold"
                >
                  {{ pago.estado }}
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones segun estado -->
          <div class="space-y-3">
            <!-- Pago exitoso -->
            <template v-if="pago.estado === 'APPROVED'">
              <Button
                label="Empezar a usar IA"
                @click="goToHerramientas"
                class="w-full"
                icon="pi pi-sparkles"
              />
              <Button
                label="Ir al dashboard"
                @click="goToDashboard"
                severity="secondary"
                text
                class="w-full"
              />
            </template>

            <!-- Pago pendiente -->
            <template v-else-if="pago.estado === 'PENDING'">
              <Button
                label="Verificar nuevamente"
                @click="verifyPayment"
                :loading="isLoading"
                class="w-full"
                icon="pi pi-refresh"
              />
              <Button
                label="Ir al dashboard"
                @click="goToDashboard"
                severity="secondary"
                text
                class="w-full"
              />
            </template>

            <!-- Pago fallido -->
            <template v-else>
              <Button
                label="Intentar de nuevo"
                @click="goToPlanes"
                class="w-full"
                icon="pi pi-replay"
              />
              <Button
                label="Ir al dashboard"
                @click="goToDashboard"
                severity="secondary"
                text
                class="w-full"
              />
            </template>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.resultado-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
</style>