<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const email = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const handleSubmit = async () => {
  if (!email.value) return

  isLoading.value = true
  error.value = null

  try {
    await api.post('/auth/forgot-password', { email: email.value })
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Error al enviar el correo de recuperación'
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
    <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-8">
         <img class="w-64 mx-auto" src="/src/assets/aideateach.png" alt="">
        <p class="text-gray-600 mt-2">Recuperar Contraseña</p>
      </div>

      <!-- Estado de éxito -->
      <div v-if="success" class="text-center space-y-4">
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <i class="pi pi-check-circle text-2xl mb-2"></i>
          <p class="font-medium">¡Correo enviado!</p>
          <p class="text-sm mt-1">
            Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
          </p>
        </div>
        <button
          type="button"
          @click="goToLogin"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          Volver al inicio de sesión
        </button>
      </div>

      <!-- Formulario -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <p class="text-gray-600 text-sm text-center">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="tu@email.com"
          />
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          <span v-if="!isLoading">Enviar enlace de recuperación</span>
          <span v-else>Enviando...</span>
        </button>

        <div class="text-center">
          <button
            type="button"
            @click="goToLogin"
            class="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            <i class="pi pi-arrow-left mr-1"></i>
            Volver al inicio de sesión
          </button>
        </div>
      </form>
    </div>
  </div>
</template>