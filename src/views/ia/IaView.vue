<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'

const prompt = ref('')
const result = ref('')
const loading = ref(false)

const generateContent = async () => {
  if (!prompt.value.trim()) return

  loading.value = true
  // Simular llamada a API de IA
  setTimeout(() => {
    result.value = `Resultado generado para: "${prompt.value}"\n\nEste es un contenido de ejemplo generado por IA...`
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div>
    <Card>
      <template #header>
        <div class="card-header">
          <h2>Generador de Contenido con IA</h2>
        </div>
      </template>
      <template #content>
        <div class="ia-container">
          <div class="input-section">
            <label for="prompt">Escribe tu prompt:</label>
            <Textarea
              id="prompt"
              v-model="prompt"
              rows="5"
              placeholder="Ej: Genera un plan de clase sobre ecuaciones cuadráticas para estudiantes de secundaria..."
              class="w-full"
            />
            <Button
              label="Generar Contenido"
              icon="pi pi-sparkles"
              @click="generateContent"
              :loading="loading"
              class="mt-3"
            />
          </div>

          <div v-if="result" class="result-section">
            <h3>Resultado:</h3>
            <Card class="result-card">
              <template #content>
                <pre class="result-text">{{ result }}</pre>
              </template>
            </Card>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.ia-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.result-section h3 {
  margin-bottom: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.result-card {
  background: #f9fafb;
}

.result-text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  color: #374151;
}
</style>
