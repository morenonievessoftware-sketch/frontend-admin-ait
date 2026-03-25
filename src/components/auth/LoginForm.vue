<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const emit = defineEmits<{
  success: []
}>()

const handleSubmit = async () => {
  const success = await authStore.login({
    email: email.value,
    password: password.value
  })

  if (success) {
    emit('success')
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Email
      </label>
      <input
        v-model="email"
        type="email"
        required
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="tu@email.com"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Contraseña
      </label>
      <div class="relative">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
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

    <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ authStore.error }}
    </div>

    <button
      type="submit"
      :disabled="authStore.isLoading"
      class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
    >
      <span v-if="!authStore.isLoading">Iniciar Sesión</span>
      <span v-else>Cargando...</span>
    </button>
  </form>
</template>
