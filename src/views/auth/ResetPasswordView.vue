<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../services/api'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const tokenValid = ref(true)

const token = ref<string | null>(null)

onMounted(() => {
  token.value = route.query.token as string || null
  if (!token.value) {
    tokenValid.value = false
  }
})

const validatePasswords = (): boolean => {
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return false
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validatePasswords()) return

  isLoading.value = true
  error.value = null

  try {
    await api.post('/auth/reset-password', {
      token: token.value,
      password: password.value
    })
    success.value = true
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Error al restablecer la contraseña'
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
        <p class="text-gray-600 mt-2">Nueva Contraseña</p>
      </div>

      <!-- Token inválido o ausente -->
      <div v-if="!tokenValid" class="text-center space-y-4">
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <i class="pi pi-times-circle text-2xl mb-2"></i>
          <p class="font-medium">Enlace inválido o expirado</p>
          <p class="text-sm mt-1">
            El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.
          </p>
        </div>
        <button
          type="button"
          @click="router.push('/forgot-password')"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          Solicitar nuevo enlace
        </button>
      </div>

      <!-- Estado de éxito -->
      <div v-else-if="success" class="text-center space-y-4">
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <i class="pi pi-check-circle text-2xl mb-2"></i>
          <p class="font-medium">¡Contraseña actualizada!</p>
          <p class="text-sm mt-1">
            Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.
          </p>
        </div>
        <button
          type="button"
          @click="goToLogin"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          Iniciar sesión
        </button>
      </div>

      <!-- Formulario -->
      <form v-else @submit.prevent="handleSubmit" class="space-y-6">
        <p class="text-gray-600 text-sm text-center">
          Ingresa tu nueva contraseña.
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Nueva contraseña
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="6"
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Confirmar contraseña
          </label>
          <div class="relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              minlength="6"
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
            </button>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
        >
          <span v-if="!isLoading">Restablecer contraseña</span>
          <span v-else>Guardando...</span>
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