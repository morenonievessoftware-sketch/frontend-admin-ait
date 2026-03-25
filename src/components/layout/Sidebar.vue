<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

interface MenuItem {
  label: string
  icon: string
  to: string
  badge?: string
  roles: ('teacher' | 'admin')[]
}

const allMenuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/dashboard', roles: ['teacher', 'admin'] },
  { label: 'Herramientas IA', icon: 'pi pi-sparkles', to: '/herramientas', roles: ['teacher', 'admin'] },
  { label: 'Mis Clases', icon: 'pi pi-book', to: '/clases', roles: ['teacher', 'admin'] },
  { label: 'Mis Materiales', icon: 'pi pi-file', to: '/materials', roles: ['teacher', 'admin'] },
  { label: 'Mi Suscripcion', icon: 'pi pi-credit-card', to: '/suscripcion/planes', roles: ['teacher'] },
  { label: 'Planes (Admin)', icon: 'pi pi-box', to: '/plans', roles: ['admin'] },
  { label: 'Suscripciones (Admin)', icon: 'pi pi-credit-card', to: '/subscriptions', roles: ['admin'] },
  { label: 'Usuarios', icon: 'pi pi-users', to: '/users', roles: ['admin'] }
]

const menuItems = computed(() => {
  const userRole = authStore.user?.rol as 'teacher' | 'admin' | undefined
  if (!userRole) return []
  return allMenuItems.filter(item => item.roles.includes(userRole))
})

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <img class="w-32" src="/src/assets/aideateach.png" alt="" srcset="">
    </div>

    <div class="sidebar-section">
      <div class="section-title">DASHBOARDS</div>
      <nav class="menu">
        <button
          v-for="item in menuItems.slice(0, 1)"
          :key="item.to"
          :class="['menu-item', { active: isActive(item.to) }]"
          @click="navigateTo(item.to)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </div>

    <div class="sidebar-section">
      <div class="section-title">APPS</div>
      <nav class="menu">
        <button
          v-for="item in menuItems.slice(1)"
          :key="item.to"
          :class="['menu-item', { active: isActive(item.to) }]"
          @click="navigateTo(item.to)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </button>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  background: #f8f9fa;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 100;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem;
  /* border-bottom: 1px solid #e5e7eb; */
}

.logo-icon {
  font-size: 1.5rem;
  color: #2563eb;
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
}

.sidebar-section {
  padding: 1.5rem 0;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  padding: 0 1.25rem;
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 0.75rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.menu-item i {
  font-size: 1.125rem;
  width: 1.25rem;
}

.menu-item:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.menu-item.active {
  background: #2563eb;
  color: white;
}

.menu-item.active:hover {
  background: #1d4ed8;
}

.badge {
  margin-left: auto;
  padding: 0.125rem 0.5rem;
  background: #ef4444;
  color: white;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
</style>
