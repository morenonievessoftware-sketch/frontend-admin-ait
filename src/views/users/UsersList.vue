<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import { z } from "zod"
import api from "../../services/api"
import Card from "primevue/card"
import Button from "primevue/button"
import ToggleSwitch from "primevue/toggleswitch"
import Dialog from "primevue/dialog"
import Toast from "../../components/ui/toast.vue"
import IconPerson from "../../assets/person.svg"

// Schema y tipo
const createUserSchema = z
    .object({
        nombre: z.string().min(1, "El nombre es requerido"),
        apellido: z.string().min(1, "El apellido es requerido"),
        email: z.string().email("Correo invalido"),
        rol: z.string().min(1, "El rol es requerido"),
        institucion: z.string(),
        estado: z.boolean(),
        password: z.string().min(6, "Debe tener al menos 6 caracteres"),
        confirmPassword: z.string().min(1, "Debes confirmar la contrasena"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contrasenas no coinciden",
        path: ["confirmPassword"],
    })

type CreateUserFormValues = z.infer<typeof createUserSchema>

interface User {
    id: string
    name: string
    email: string
    rol_usuario: string
    created_at: string
    estado: boolean
}

interface Toast{
    title: string
    message: string
    type?: "success" | "info" | "warn" | "error" | "secondary" | "contrast"
}

const users = ref<User[]>([])
const loading = ref(false)
const isLoading = ref(false)
const isVisible = ref(false)
const toast = ref<Toast>({ 
    title: "", 
    message: "" 
})

const {
    errors,
    isSubmitting: submitting,
    defineField,
    handleSubmit,
    resetForm,
} = useForm<CreateUserFormValues>({
    validationSchema: toTypedSchema(createUserSchema),
    initialValues: {
        nombre: "",
        apellido: "",
        email: "",
        rol: "",
        institucion: "",
        estado: true,
        password: "",
        confirmPassword: "",
    },
})

const [nombre, nombreAttrs] = defineField("nombre")
const [apellido, apellidoAttrs] = defineField("apellido")
const [email, emailAttrs] = defineField("email")
const [rol, rolAttrs] = defineField("rol")
const [institucion, institucionAttrs] = defineField("institucion")
const [estado] = defineField("estado")
const [password, passwordAttrs] = defineField("password")
const [confirmPassword, confirmPasswordAttrs] = defineField("confirmPassword") // Para confirmaciÃƒÆ’Ã‚Â³n, no se envÃƒÆ’Ã‚Â­a al backend


const inputBase = "w-full rounded-lg border px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:ring-2"
const inputOk = "border-slate-300 focus:border-blue-500 focus:ring-blue-200"
const inputErr = "border-red-400 focus:border-red-500 focus:ring-red-100"

const listarUsuarios = async () => {
    try {
        loading.value = true
        const { data } = await api.get("/users")
        users.value = data
    } catch (error) {
        console.error(error)
    } finally {
        loading.value = false
    }
}

const cambioEstadoUsuario = async (userId: string) => {
    try {
        await api.patch(`/users/${userId}/estado`)
    } catch (error) {
        console.error("No es posible actualizar estado del usuario", error)
    }
}

const toggleModal = () => {
    isVisible.value = !isVisible.value
}

const createUser = handleSubmit(async (payload) => {
    try {
        isLoading.value = true
        const { confirmPassword, ...payloadToSend } = payload
        await api.post("/users/register", payloadToSend)
        toggleModal()
        toast.value = { title: "Usuario Registrado", message: "Usuario registrado correctamente", type: "success" }
        listarUsuarios()
    } catch (error) {
        toast.value = { title: "Error", message: "Error al crear usuario", type: "error" }
        console.error("Error al crear usuario", error)
    } finally {
        isLoading.value = false
    }

})

onMounted(listarUsuarios)
</script>

<template>
    <div>
        <Card>
            <template #header>
                <div class="card-header">
                    <h2>Listado de Usuarios</h2>
                    <Button label="Nuevo Usuario" icon="pi pi-plus" @click="toggleModal" />
                </div>
            </template>
            <template #content>
                <div class="flex flex-wrap gap-4">
                    <div v-for="user in users" :key="user.id">
                        <Card class="w-xs overflow-hidden text-center">
                            <template #header>
                                <div class="justify-self-end p-1.5">
                                    <ToggleSwitch v-model="user.estado" @change="cambioEstadoUsuario(user.id)" />
                                </div>
                                <img :src="IconPerson" alt="icono" class="size-40 w-full" />
                            </template>
                            <template #title>{{ user.name }}</template>
                            <template #subtitle>{{ user.rol_usuario }}</template>
                            <template #content>
                                <p class="m-0">{{ user.email }}</p>
                            </template>
                        </Card>
                    </div>
                </div>
            </template>
        </Card>
    </div>

    <Dialog v-model:visible="isVisible" modal :style="{ width: '50rem' }" :draggable="false"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }" @hide="resetForm">
        <template #header>
            <h2 class="mb-4 text-xl font-semibold text-gray-800">Registrar Nuevo Usuario</h2>
        </template>

        <form @submit="createUser" class="space-y-6">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">

                <!-- Nombre -->
                <div class="space-y-2">
                    <label for="nombre" class="block text-sm font-medium text-slate-700">Nombre</label>
                    <input id="nombre" v-model.trim="nombre" v-bind="nombreAttrs" type="text"
                        placeholder="Ingresa el nombre" :class="[inputBase, errors.nombre ? inputErr : inputOk]" />
                    <p v-if="errors.nombre" class="text-xs font-medium text-red-600">{{ errors.nombre }}</p>
                </div>

                <!-- Apellido -->
                <div class="space-y-2">
                    <label for="apellido" class="block text-sm font-medium text-slate-700">Apellido</label>
                    <input id="apellido" v-model.trim="apellido" v-bind="apellidoAttrs" type="text"
                        placeholder="Ingresa el apellido" :class="[inputBase, errors.apellido ? inputErr : inputOk]" />
                    <p v-if="errors.apellido" class="text-xs font-medium text-red-600">{{ errors.apellido }}</p>
                </div>

                <!-- Email -->
                <div class="space-y-2">
                    <label for="email" class="block text-sm font-medium text-slate-700">Correo</label>
                    <input id="email" v-model.trim="email" v-bind="emailAttrs" type="email"
                        placeholder="correo@dominio.com" :class="[inputBase, errors.email ? inputErr : inputOk]" />
                    <p v-if="errors.email" class="text-xs font-medium text-red-600">{{ errors.email }}</p>
                </div>

                <!-- Rol -->
                <div class="space-y-2">
                    <label for="rol" class="block text-sm font-medium text-slate-700">Rol</label>
                    <select id="rol" v-model="rol" v-bind="rolAttrs"
                        :class="[inputBase, errors.rol ? inputErr : inputOk]">
                        <option value="">-- Seleccione --</option>
                        <option value="teacher">Docente</option>
                        <option value="admin">Admin</option>
                    </select>
                    <p v-if="errors.rol" class="text-xs font-medium text-red-600">{{ errors.rol }}</p>
                </div>

                <!-- Institución -->
                <div class="space-y-2">
                    <label for="institucion" class="block text-sm font-medium text-slate-700">Institución</label>
                    <input id="institucion" v-model.trim="institucion" v-bind="institucionAttrs" type="text"
                        placeholder="Nombre de la institución"
                        :class="[inputBase, errors.institucion ? inputErr : inputOk]" />
                    <p v-if="errors.institucion" class="text-xs font-medium text-red-600">{{ errors.institucion }}</p>
                </div>

                <!-- Estado -->
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-slate-700">Estado</label>
                    <div
                        class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <span class="text-sm text-slate-600">{{ estado ? "Activo" : "Inactivo" }}</span>
                        <ToggleSwitch v-model="estado" />
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="password" class="block text-sm font-medium text-slate-700">Contraseña</label>
                    <input id="password" v-model.trim="password" v-bind="passwordAttrs" type="password"
                        placeholder="Ingrese su contraseña"
                        :class="[inputBase, errors.password ? inputErr : inputOk]" />
                    <p v-if="errors.password" class="text-xs font-medium text-red-600">{{ errors.password }}</p>
                </div>

                <div class="space-y-2">
                    <label for="confirmPassword" class="block text-sm font-medium text-slate-700">Confirmar
                        Contraseña</label>
                    <input id="confirmPassword" v-model.trim="confirmPassword" v-bind="confirmPasswordAttrs"
                        type="password" placeholder="Confirme su contraseña"
                        :class="[inputBase, errors.confirmPassword ? inputErr : inputOk]" />
                    <p v-if="errors.confirmPassword" class="text-xs font-medium text-red-600">{{ errors.confirmPassword
                        }}
                    </p>
                </div>

            </div>

            <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button label="Cancelar" type="button" severity="secondary" outlined class="w-full sm:w-auto"
                    @click="toggleModal" />
                <Button label="Registrar" :icon="isLoading ? 'pi pi-spin' : 'pi pi-check'" type="submit"
                    class="w-full sm:w-auto" :loading="submitting" :disabled="isLoading ? true : false" />
            </div>
        </form>
    </Dialog>
    <Toast :title="toast.title" :message="toast.message" :type="toast.type"/>
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
</style>
