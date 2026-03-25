<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const newItem = ref('')

const addItem = () => {
  const trimmed = newItem.value.trim()
  if (trimmed && !props.modelValue.includes(trimmed)) {
    emit('update:modelValue', [...props.modelValue, trimmed])
    newItem.value = ''
  }
}

const removeItem = (index: number) => {
  const updated = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', updated)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    addItem()
  }
}
</script>

<template>
  <div class="tags-input-container">
    <div class="input-row">
      <input
        v-model="newItem"
        type="text"
        :placeholder="placeholder || 'Agregar característica...'"
        class="tags-input"
        @keydown="handleKeydown"
      />
      <Button
        type="button"
        icon="pi pi-plus"
        severity="secondary"
        @click="addItem"
        :disabled="!newItem.trim()"
      />
    </div>

    <div v-if="modelValue.length > 0" class="tags-list">
      <Tag
        v-for="(item, index) in modelValue"
        :key="index"
        :value="item"
        severity="info"
        class="tag-item"
      >
        <span>{{ item }}</span>
        <button
          type="button"
          class="tag-remove"
          @click="removeItem(index)"
        >
          <i class="pi pi-times"></i>
        </button>
      </Tag>
    </div>
  </div>
</template>

<style scoped>
.tags-input-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-row {
  display: flex;
  gap: 0.5rem;
}

.tags-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.tags-input:focus {
  border-color: var(--primary-color, #6366f1);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.25rem;
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.tag-remove:hover {
  background: rgba(0, 0, 0, 0.2);
}

.tag-remove i {
  font-size: 0.625rem;
}
</style>
