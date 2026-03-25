<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'

const router = useRouter()
const authStore = useAuthStore()

const emit = defineEmits<{
  toggleSidebar: []
}>()

const searchQuery = ref('')
const userMenu = ref()

const userMenuItems = ref([
  {
    label: 'Perfil',
    icon: 'pi pi-user',
    command: () => router.push('/profile')
  },
  {
    label: 'Configuración',
    icon: 'pi pi-cog',
    command: () => router.push('/settings')
  },
  {
    separator: true
  },
  {
    label: 'Cerrar Sesión',
    icon: 'pi pi-sign-out',
    command: () => handleLogout()
  }
])

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event)
}

const handleLogout = async () => {
  authStore.logout()
  router.push('/login')
}

const handleSearch = () => {
  console.log('Searching:', searchQuery.value)
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-left">
      <button class="menu-toggle" @click="emit('toggleSidebar')">
        <i class="pi pi-bars"></i>
      </button>
       <img class="w-40" src="/src/assets/aideateach.png" alt="" srcset="">
    </div>

    <div class="navbar-center">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <div class="navbar-right">
      <button class="icon-button">
        <i class="pi pi-cog"></i>
      </button>

      <button class="icon-button">
        <i class="pi pi-bell"></i>
        <span class="notification-badge">3</span>
      </button>

      <button class="user-button" @click="toggleUserMenu">
        <Avatar
          :label="authStore.user?.nombre?.charAt(0).toUpperCase() || 'U'"
          shape="circle"
          style="background-color: #2563eb; color: white;"
        />
      </button>

      <Menu ref="userMenu" :model="userMenuItems" popup />

      <button class="menu-toggle-mobile" @click="emit('toggleSidebar')">
        <i class="pi pi-align-right"></i>
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 90;
  gap: 1rem;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.menu-toggle:hover {
  background: #f3f4f6;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.navbar-center {
  flex: 1;
  max-width: 500px;
  display: flex;
  justify-content: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.625rem 1rem;
  width: 100%;
  max-width: 400px;
}

.search-box i {
  color: #9ca3af;
  font-size: 1rem;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.875rem;
  color: #1f2937;
  width: 100%;
}

.search-box input::placeholder {
  color: #9ca3af;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.icon-button {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 1.125rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background: #f3f4f6;
}

.notification-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  transition: opacity 0.2s;
}

.user-button:hover {
  opacity: 0.8;
}

.menu-toggle-mobile {
  display: none;
}

/* Responsive */
@media (max-width: 1024px) {
  .navbar-center {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 1rem;
  }

  .menu-toggle {
    display: flex;
  }

  .page-title {
    font-size: 1.125rem;
  }

  .navbar-center {
    display: none;
  }

  .icon-button {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .menu-toggle-mobile {
    display: flex;
  }
}

@media (max-width: 480px) {
  .navbar-right {
    gap: 0.5rem;
  }

  .icon-button:first-child {
    display: none;
  }
}
</style>
