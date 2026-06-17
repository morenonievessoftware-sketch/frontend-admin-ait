<script setup lang="ts">
import { ref } from "vue"
import { z } from "zod"
import { useForm } from "vee-validate"
import { toTypedSchema } from "@vee-validate/zod"
import Dialog from "primevue/dialog"
import Button from "primevue/button"
import ToggleSwitch from "primevue/toggleswitch"
import Toast from "../../../components/ui/toast.vue"
import api from "../../../services/api"

const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const toast = ref<Toast>({ 
    title: "", 
    message: "" 
})

interface Toast{
    title: string
    message: string
    type?: "success" | "info" | "warn" | "error" | "secondary" | "contrast"
}

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

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


const emit = defineEmits<{
    (event: "update:visible", value: boolean): void
    (event: "isSaved", value: boolean): void
}>()

const cerrarModal = (event: any) => {
    emit("update:visible", event)
    resetForm()
}

const createUser = handleSubmit(async (payload) => {
    try {
        isLoading.value = true
        const { confirmPassword, ...payloadToSend } = payload
        await api.post("/users/register", payloadToSend)
        toast.value = { title: "Usuario Registrado", message: "Usuario registrado correctamente", type: "success" }
        emit("isSaved", true)
        cerrarModal(false)
        
    } catch (error) {
        toast.value = { title: "Error", message: "Error al crear usuario", type: "error" }
        console.error("Error al crear usuario", error)
    } finally {
        isLoading.value = false
    }

})

</script>
<template>
    <Dialog :visible="props.visible" modal :style="{ width: '50rem' }" 
        :draggable="false" @update:visible="cerrarModal"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
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
                    <div class="relative">
                        <input id="password" v-model.trim="password" v-bind="passwordAttrs" 
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Ingrese su contraseña"
                        :class="[inputBase, errors.password ? inputErr : inputOk]" />
                        <button @click="showPassword = !showPassword" type="button" class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                        </button>
                    </div>
                    <p v-if="errors.password" class="text-xs font-medium text-red-600">{{ errors.password }}</p>
                </div>

                <div class="space-y-2">
                    <label for="confirmPassword" class="block text-sm font-medium text-slate-700">Confirmar
                        Contraseña</label>
                    <div class="relative">
                        <input id="confirmPassword" v-model.trim="confirmPassword" v-bind="confirmPasswordAttrs"
                        :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirme su contraseña"
                        :class="[inputBase, errors.confirmPassword ? inputErr : inputOk]" />
                        <button 
                        @click="showConfirmPassword = !showConfirmPassword"
                        type="button" class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                        </button>
                    </div>
                    <p v-if="errors.confirmPassword" class="text-xs font-medium text-red-600">{{ errors.confirmPassword}}</p>
                </div>
            </div>

            <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button label="Cancelar" type="button" severity="secondary" outlined class="w-full sm:w-auto"
                    @click="cerrarModal(false)" />
                <Button label="Registrar" :icon="isLoading ? 'pi pi-spin' : 'pi pi-check'" type="submit"
                    class="w-full sm:w-auto" :loading="submitting" :disabled="isLoading ? true : false" />
            </div>
        </form>
    </Dialog>
    <Toast :title="toast.title" :message="toast.message" :type="toast.type"/>
</template>
<style lang="scss" scoped>
    
</style>
