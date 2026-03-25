<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'

declare const google: any

const authStore = useAuthStore()
const googleBtnRef = ref<HTMLDivElement | null>(null)

const emit = defineEmits<{
  success: []
  error: [message: string]
}>()

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const handleGoogleCallback = async (response: any) => {
  try {
    const success = await authStore.loginWithGoogle(response.credential)
    if (success) {
      emit('success')
    } else {
      emit('error', authStore.error || 'Error al iniciar sesión con Google')
    }
  } catch (err: any) {
    emit('error', err.message || 'Error al iniciar sesión con Google')
  }
}

const initializeGoogle = () => {
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
    })

    if (googleBtnRef.value) {
      google.accounts.id.renderButton(googleBtnRef.value, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        locale: 'es',
      })
    }
  } else {
    // Reintentar si el SDK no está listo
    setTimeout(initializeGoogle, 100)
  }
}

onMounted(() => {
  initializeGoogle()
})
</script>

<template>
  <div ref="googleBtnRef" class="google-btn-container"></div>
</template>

<style scoped>
.google-btn-container {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
