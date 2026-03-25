<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const subscriptions = ref([
  { id: 1, user: 'Juan Pérez', plan: 'Plan Pro', startDate: '2024-01-15', status: 'Activa' },
  { id: 2, user: 'María García', plan: 'Plan Básico', startDate: '2024-02-20', status: 'Activa' },
  { id: 3, user: 'Carlos López', plan: 'Plan Enterprise', startDate: '2024-01-10', status: 'Activa' }
])
</script>

<template>
  <div>
    <Card>
      <template #header>
        <div class="card-header">
          <h2>Suscripciones</h2>
          <Button label="Nueva Suscripción" icon="pi pi-plus" />
        </div>
      </template>
      <template #content>
        <DataTable :value="subscriptions" stripedRows paginator :rows="10">
          <Column field="user" header="Usuario" sortable />
          <Column field="plan" header="Plan" sortable />
          <Column field="startDate" header="Fecha Inicio" sortable />
          <Column field="status" header="Estado" sortable>
            <template #body="slotProps">
              <span :class="['status-badge', slotProps.data.status.toLowerCase()]">
                {{ slotProps.data.status }}
              </span>
            </template>
          </Column>
          <Column header="Acciones">
            <template #body>
              <div class="actions">
                <Button icon="pi pi-eye" text rounded severity="info" />
                <Button icon="pi pi-ban" text rounded severity="danger" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.activa {
  background: #d1fae5;
  color: #065f46;
}
</style>
