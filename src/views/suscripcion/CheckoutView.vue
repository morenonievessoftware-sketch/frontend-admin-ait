<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getPlanById } from '../../services/planes'
import { iniciarPago } from '../../services/pagos'
import type { Plan, WompiData } from '../../types'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

// Declarar el tipo para el WidgetCheckout de Wompi
declare global {
  interface Window {
    WidgetCheckout: any
  }
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const plan = ref<Plan | null>(null)
const wompiData = ref<WompiData | null>(null)
const pagoReference = ref<string | null>(null)
const isLoading = ref(true)
const isProcessing = ref(false)
const error = ref<string | null>(null)

const apiKeyWompi = import.meta.env.VITE_WOMPI_PUBLIC_KEY

const planId = computed(() => route.params.planId as string)

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

// Cargar el script de Wompi
const loadWompiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.WidgetCheckout) {
      resolve()
      return
    }

    if (document.getElementById('wompi-widget-script')) {
      // Script ya cargando, esperar a que termine
      const checkLoaded = setInterval(() => {
        if (window.WidgetCheckout) {
          clearInterval(checkLoaded)
          resolve()
        }
      }, 100)
      return
    }

    const script = document.createElement('script')
    script.id = 'wompi-widget-script'
    script.src = 'https://checkout.wompi.co/widget.js'
    script.async = true
    script.onload = () => {
      // Esperar un momento para que WidgetCheckout esté disponible
      setTimeout(() => resolve(), 100)
    }
    script.onerror = () => reject(new Error('Error cargando widget de Wompi'))
    document.head.appendChild(script)
  })
}

// Abrir el widget de checkout de Wompi
const openWompiWidget = async () => {
  if (!wompiData.value || !plan.value) return

  try {
    await loadWompiScript()

    const checkout = new window.WidgetCheckout({
      currency: wompiData.value.currency,
      amountInCents: wompiData.value.amountInCents,
      reference: wompiData.value.reference,
      publicKey: apiKeyWompi,
      signature: {
        integrity: wompiData.value.signature
      }
    })

    checkout.open((result: any) => {
      if (result?.transaction) {
        router.push({
          name: 'pago-resultado',
          query: {
            ref: wompiData.value?.reference,
            id: result.transaction.id
          }
        })
      }
    })
  } catch (err) {
    console.error('Error abriendo widget de Wompi:', err)
    error.value = 'Error al abrir el formulario de pago'
  }
}

// Iniciar el proceso de pago
const initPayment = async () => {
  if (!plan.value) return

  try {
    isProcessing.value = true
    error.value = null

    const response = await iniciarPago({
      planId: plan.value.id,
      monto: plan.value.precio,
      descripcion: `Suscripcion ${plan.value.nombre}`,
      customerEmail: authStore.user?.email,
      customerFullName: authStore.user?.nombre,
      redirectUrl: `${window.location.origin}/suscripcion/resultado`
    })    
    wompiData.value = response.data.wompi
    pagoReference.value = response.data.reference

    // Abrir widget automaticamente
    await openWompiWidget()
  } catch (err: any) {
    console.error('Error iniciando pago:', err)
    error.value = err.response?.data?.message || 'Error al iniciar el pago'
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  try {
    isLoading.value = true

    if (!planId.value) {
      error.value = 'Plan no especificado'
      return
    }

    plan.value = await getPlanById(planId.value)
  } catch (err) {
    console.error('Error cargando plan:', err)
    error.value = 'Error al cargar el plan'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="checkout-container">
    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
      <ProgressSpinner />
      <p class="mt-4 text-gray-600">Cargando informacion del plan...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error && !plan" class="text-center py-16">
      <i class="pi pi-exclamation-triangle text-5xl text-red-500 mb-4"></i>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Error</h2>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <Button label="Volver a planes" @click="router.push({ name: 'planes' })" />
    </div>

    <!-- Checkout -->
    <div v-else-if="plan" class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">
        Confirmar suscripcion
      </h1>

      <Card class="mb-6">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Resumen de compra</span>
            <i class="pi pi-shopping-cart text-primary"></i>
          </div>
        </template>

        <template #content>
          <div class="space-y-4">
            <!-- Plan seleccionado -->
            <div class="flex justify-between items-center py-3 border-b">
              <div>
                <p class="font-semibold text-gray-900">{{ plan.nombre }}</p>
                <p class="text-sm text-gray-500">
                  {{ plan.aiQueriesLimit }} consultas IA / {{ getDurationLabel(plan.duration) }}
                </p>
              </div>
              <p class="text-lg font-bold text-primary">
                {{ formatPrice(plan.precio) }}
              </p>
            </div>

            <!-- Descripcion -->
            <div v-if="plan.descripcion" class="py-2">
              <p class="text-sm text-gray-600">{{ plan.descripcion }}</p>
            </div>

            <!-- Total -->
            <div class="flex justify-between items-center py-4 border-t-2 border-gray-200">
              <span class="text-lg font-semibold">Total a pagar</span>
              <span class="text-2xl font-bold text-primary">
                {{ formatPrice(plan.precio) }}
              </span>
            </div>

            <!-- Informacion de pago -->
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="flex items-start gap-3">
                <i class="pi pi-shield text-blue-600 text-xl mt-0.5"></i>
                <div>
                  <p class="font-medium text-blue-900">Pago seguro con Wompi</p>
                  <p class="text-sm text-blue-700">
                    Tus datos estan protegidos. Aceptamos tarjetas de credito, debito, PSE y Nequi.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error de pago -->
            <div v-if="error" class="bg-red-50 p-4 rounded-lg">
              <div class="flex items-center gap-3">
                <i class="pi pi-exclamation-circle text-red-600"></i>
                <p class="text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex flex-col gap-3">
            <Button
              :label="isProcessing ? 'Procesando...' : 'Pagar ahora'"
              :loading="isProcessing"
              :disabled="isProcessing"
              @click="initPayment"
              class="w-full"
              size="large"
              icon="pi pi-credit-card"
            />
            <Button
              label="Volver a planes"
              @click="router.push({ name: 'planes' })"
              severity="secondary"
              text
              class="w-full"
            />
          </div>
        </template>
      </Card>

      <!-- Metodos de pago -->
      <div class="text-center">
        <p class="text-sm text-gray-500 mb-3">Metodos de pago aceptados</p>
        <div class="flex justify-center gap-4 flex-wrap">
          <span class="px-3 py-1 bg-gray-100 rounded text-sm">Visa</span>
          <span class="px-3 py-1 bg-gray-100 rounded text-sm">Mastercard</span>
          <span class="px-3 py-1 bg-gray-100 rounded text-sm">PSE</span>
          <span class="px-3 py-1 bg-gray-100 rounded text-sm">Nequi</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
</style>