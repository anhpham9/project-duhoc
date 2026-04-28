<template>
    <div class="flex justify-between items-center mb-4">
        <input v-model="search" @input="$emit('update:search', search)" type="text" placeholder="Tìm kiếm..."
            class="border px-2 py-1 rounded w-64" />
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
const props = defineProps({
    modelValue: String
})
const emit = defineEmits(['update:search'])
const search = ref(props.modelValue || '')
watch(() => props.modelValue, v => search.value = v)
</script>
