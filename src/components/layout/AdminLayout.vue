<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from './Navbar.vue'

const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <Sidebar :class="{ 'mobile-open': sidebarOpen }" />

    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- Main content area -->
    <div class="main-content">
      <Navbar @toggle-sidebar="toggleSidebar" />

      <!-- Content -->
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f9fafb;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-x: hidden;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .sidebar-overlay {
    display: block;
  }

  .content {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .content {
    padding: 1rem 0.75rem;
  }
}
</style>
