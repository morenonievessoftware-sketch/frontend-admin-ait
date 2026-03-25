<script setup lang="ts">
import { onMounted, ref } from "vue"
import api from "../../services/api"
import Card from 'primevue/card'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import IconPerson from '../../assets/person.svg'

interface User {
    id: string
    name: string
    email: string
    rol_usuario: string
    created_at: string
    estado: boolean
}

const ListUsers = ref<User[]>([])
const loading = ref(false)

const listarUsuarios = async () => {
    try {
        loading.value = true
        const res = await api.get('/users')
        ListUsers.value = res.data
        console.log(res.data)
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const cambioEstadoUsuario = async(userId:string)=>{
    try {
        const {data} = await api.patch(`/users/${userId}/estado`)
        console.log(userId);
        console.log(data);
    } catch (error) {
        console.error('no es posible actualizar estado del usuario',error);
    }
}

onMounted(() => {
    listarUsuarios()
})
</script>

<template>
    <div>
        <Card>
            <template #header>
                <div class="card-header">
                    <h2>Listado de Usuarios</h2>
                    <Button label="Nuevo Usuario" icon="pi pi-plus" />
                </div>
            </template>
            <template #content>
                <div class="flex flex-wrap gap-4">
                <div v-for="(user,u) in ListUsers" :key="u">
                    <Card class="w-xs text-center overflow-hidden">
                        <template #header>
                            <div class="justify-self-end p-1.5">
                                <ToggleSwitch v-model="user.estado" @change="cambioEstadoUsuario(user.id)"/>
                            </div>
                            <img :src="IconPerson" alt="icono" class="size-40 w-full text-center"/>
                        </template>
                        <template #title>{{ user.name }}</template>
                        <template #subtitle>{{ user.rol_usuario}}</template>
                        <template #content>
                            <p class="m-0">
                                {{user.email}}
                            </p>
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
</style>