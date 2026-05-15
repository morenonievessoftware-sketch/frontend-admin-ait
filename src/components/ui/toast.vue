<script setup lang="ts">
import { watch } from "vue"
import PrimeToast from "primevue/toast"
import { useToast } from "primevue/usetoast"

type AlertType = "success" | "info" | "warn" | "error" | "secondary" | "contrast"

interface ShowToastPayload {
    title: string
    message: string
    type?: AlertType
}

const props = withDefaults(
    defineProps<{
        title?: string
        message?: string
        type?: AlertType
        life?: number
        group?: string
        position?:
            | "top-left"
            | "top-center"
            | "top-right"
            | "bottom-left"
            | "bottom-center"
            | "bottom-right"
            | "center"
    }>(),
    {
        title: "",
        message: "",
        type: "info",
        life: 3000,
        group: "app-toast",
        position: "top-right",
    }
)

const toast = useToast()

const show = (payload?: ShowToastPayload) => {
    const summary = payload?.title ?? props.title
    const detail = payload?.message ?? props.message
    const severity = payload?.type ?? props.type

    if (!summary && !detail) {
        return
    }

    toast.add({
        group: props.group,
        severity,
        summary,
        detail,
        life: props.life,
    })
}

watch(
    () => [props.title, props.message, props.type] as const,
    ([title, message, type]) => {
        const hasContent = Boolean(title || message)

        if (hasContent) {
            show({
                title: title ?? "",
                message: message ?? "",
                type,
            })
        }
    },
    { immediate: true }
)

defineExpose({ show })
</script>

<template>
    <PrimeToast :group="group" :position="position" />
</template>
