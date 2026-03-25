import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AdminLayout from '../components/layout/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated ? '/dashboard' : '/login'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPasswordView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/auth/ResetPasswordView.vue'),
      meta: { requiresAuth: false }
    },
    // Rutas con AdminLayout
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/dashboard/DashboardView.vue')
        },
        {
          path: 'users',
          name: 'users',
          redirect: '/users/list',
          children: [
            {
              path: 'list',
              name: 'list-users',
              component: () => import('../views/users/UsersList.vue')
            }
          ]
        },
        {
          path: 'plans',
          name: 'plans',
          component: () => import('../views/plans/PlansView.vue')
        },
        {
          path: 'subscriptions',
          name: 'subscriptions',
          component: () => import('../views/subscriptions/SubscriptionsView.vue')
        },
        {
          path: 'herramientas',
          name: 'herramientas',
          component: () => import('../views/herramientas/HerramientasView.vue'),
          meta: { requiresTeacher: true }
        },
        {
          path: 'herramientas/:tipo',
          name: 'generador',
          component: () => import('../views/herramientas/GeneradorView.vue'),
          meta: { requiresTeacher: true }
        },
        {
          path: 'clases',
          name: 'clases',
          component: () => import('../views/clases/ClasesView.vue'),
          meta: { requiresTeacher: true }
        },
        {
          path: 'clases/:id',
          name: 'clase-detalle',
          component: () => import('../views/clases/ClaseDetalleView.vue'),
          meta: { requiresTeacher: true }
        },
        {
          path: 'clases/:id/generar',
          name: 'clase-generar',
          component: () => import('../views/clases/ClaseGeneradorView.vue'),
          meta: { requiresTeacher: true }
        },
        {
          path: 'materials',
          name: 'materials',
          component: () => import('../views/materials/MaterialsView.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/profile/ProfileView.vue')
        },
        // Rutas de suscripcion y pagos
        {
          path: 'suscripcion/planes',
          name: 'planes',
          component: () => import('../views/suscripcion/PlanesView.vue'),
          meta: { requiresTeacher: true }
        },
        {
          path: 'suscripcion/checkout/:planId',
          name: 'checkout',
          component: () => import('../views/suscripcion/CheckoutView.vue'),
          meta: { requiresTeacher: true }
        },
        {
          path: 'suscripcion/resultado',
          name: 'pago-resultado',
          component: () => import('../views/suscripcion/ResultadoView.vue'),
          meta: { requiresTeacher: true }
        }
      ]
    }
  ]
})

// Navigation Guard - Proteger rutas
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Si hay token pero no usuario, cargar perfil antes de validar rutas
  if (authStore.accessToken && !authStore.user) {
    await authStore.fetchUser()
  }

  // Rutas que requieren autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Rutas que requieren ser teacher o admin
  if (to.meta.requiresTeacher && !authStore.isTeacher && !authStore.isAdmin) {
    next('/dashboard')
    return
  }

  // Si está autenticado y va a login/register, redirigir a dashboard
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router
