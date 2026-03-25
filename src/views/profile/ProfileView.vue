<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import api from '../../services/api'

const authStore = useAuthStore()
const toast = useToast()

// Estado del formulario de perfil
const nombre = ref('')
const email = ref('')
const isLoadingProfile = ref(false)

// Estado del formulario de contraseña
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoadingPassword = ref(false)

// Datos del usuario actual
const user = computed(() => authStore.user)

onMounted(() => {
  if (user.value) {
    nombre.value = user.value.nombre || ''
    email.value = user.value.email || ''
  }
})

const handleUpdateProfile = async () => {
  if (!nombre.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Atención',
      detail: 'El nombre es requerido',
      life: 3000
    })
    return
  }

  isLoadingProfile.value = true

  try {
    await api.put(`/usuarios/${user.value?.id}`, {
      nombre: nombre.value
    })

    // Actualizar el store localmente
    if (authStore.user) {
      authStore.user.nombre = nombre.value
    }

    toast.add({
      severity: 'success',
      summary: 'Perfil actualizado',
      detail: 'Tus datos han sido actualizados correctamente',
      life: 3000
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.error || 'Error al actualizar el perfil',
      life: 3000
    })
  } finally {
    isLoadingProfile.value = false
  }
}

const handleChangePassword = async () => {
  // Validaciones
  if (!currentPassword.value) {
    toast.add({
      severity: 'warn',
      summary: 'Atención',
      detail: 'Ingresa tu contraseña actual',
      life: 3000
    })
    return
  }

  if (newPassword.value.length < 6) {
    toast.add({
      severity: 'warn',
      summary: 'Atención',
      detail: 'La nueva contraseña debe tener al menos 6 caracteres',
      life: 3000
    })
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: 'warn',
      summary: 'Atención',
      detail: 'Las contraseñas no coinciden',
      life: 3000
    })
    return
  }

  isLoadingPassword.value = true

  try {
    await api.put('/auth/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })

    // Limpiar formulario
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    toast.add({
      severity: 'success',
      summary: 'Contraseña actualizada',
      detail: 'Tu contraseña ha sido cambiada correctamente',
      life: 3000
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.response?.data?.error || 'Error al cambiar la contraseña',
      life: 3000
    })
  } finally {
    isLoadingPassword.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <Toast />

    <h1 class="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Información del perfil -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <i class="pi pi-user text-blue-600 text-xl"></i>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Información Personal</h2>
            <p class="text-sm text-gray-500">Actualiza tus datos básicos</p>
          </div>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              v-model="nombre"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              disabled
              class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p class="text-xs text-gray-400 mt-1">El correo no puede ser modificado</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <div class="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
              <span class="inline-flex items-center gap-2">
                <i :class="user?.rol === 'admin' ? 'pi pi-shield' : 'pi pi-graduation-cap'" class="text-blue-600"></i>
                <span class="text-gray-700 capitalize">{{ user?.rol }}</span>
              </span>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoadingProfile"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 mt-4"
          >
            <span v-if="!isLoadingProfile">Guardar cambios</span>
            <span v-else>Guardando...</span>
          </button>
        </form>
      </div>

      <!-- Cambiar contraseña -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <i class="pi pi-lock text-orange-600 text-xl"></i>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-800">Cambiar Contraseña</h2>
            <p class="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
          </div>
        </div>

        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
            <div class="relative">
              <input
                v-model="currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <i :class="showCurrentPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
            <div class="relative">
              <input
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-lg"></i>
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar nueva contraseña</label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
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

          <button
            type="submit"
            :disabled="isLoadingPassword"
            class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 mt-4"
          >
            <span v-if="!isLoadingPassword">Cambiar contraseña</span>
            <span v-else>Cambiando...</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>