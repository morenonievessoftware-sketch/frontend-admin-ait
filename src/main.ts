import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import router from './router'
import App from './App.vue'
import './style.css'
import 'primeicons/primeicons.css'

/**
 * 🚀 BOOTSTRAP DE LA APLICACIÓN
 *
 * Aquí configuramos:
 * 1. Pinia - Gestión de estado
 * 2. Vue Router - Navegación
 * 3. PrimeVue - Librería de componentes UI
 * 4. App - Componente raíz
 */

const app = createApp(App)

// Configurar Pinia (debe ir antes del router)
const pinia = createPinia()
app.use(pinia)

// Configurar PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark-mode'
    }
  }
})

// Configurar ToastService
app.use(ToastService)

// Registrar directiva Tooltip
app.directive('tooltip', Tooltip)

// Configurar Vue Router
app.use(router)

// Montar la aplicación
app.mount('#app')
