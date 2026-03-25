<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<template>
  <div class="divider">
    <span class="divider-text">{{ text || 'o' }}</span>
  </div>
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}

.divider-text {
  padding: 0 16px;
  color: #9ca3af;
  font-size: 14px;
}
</style>
