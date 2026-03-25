<script setup lang="ts">
import { useRouter } from 'vue-router'
import GoogleLoginButton from '../components/auth/GoogleLoginButton.vue'
import AuthDivider from '../components/auth/AuthDivider.vue'
import LoginForm from '../components/auth/LoginForm.vue'

const router = useRouter()

const handleLoginSuccess = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600">
    <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-8">
        <img src="/src/assets/aideateach.png" alt="" srcset="">
        <p class="text-gray-600 mt-2">Asistente IA para Docentes</p>
      </div>

      <!-- Login con Google -->
      <GoogleLoginButton @success="handleLoginSuccess" />

      <!-- Separador -->
      <AuthDivider text="o continúa con tu email" />

      <!-- Formulario tradicional -->
      <LoginForm @success="handleLoginSuccess" />

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          ¿Olvidaste tu contraseña?
          <router-link to="/forgot-password" class="text-blue-600 hover:text-blue-700 font-semibold">
            Recupérala aquí
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
