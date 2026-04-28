
<template>
    <div class="pagination-container">
        <button :disabled="modelValue === 1" @click="$emit('update:modelValue', 1)" class="pagination-btn">«</button>
        <button
            v-for="page in visiblePages"
            :key="page"
            :class="['pagination-btn', { 'pagination-current': page === modelValue }]"
            :disabled="page === modelValue"
            @click="$emit('update:modelValue', page)"
        >
            {{ page }}
        </button>
        <button :disabled="modelValue === totalPages" @click="$emit('update:modelValue', totalPages)" class="pagination-btn">»</button>
    </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
    modelValue: { type: Number, required: true },
    totalPages: { type: Number, required: true }
})
defineEmits(['update:modelValue'])

const visiblePages = computed(() => {
    const total = props.totalPages
    const current = props.modelValue
    let start = Math.max(1, current - 1)
    let end = start + 2
    if (end > total) {
        end = total
        start = Math.max(1, end - 2)
    }
    const arr = []
    for (let i = start; i <= end; i++) arr.push(i)
    return arr
})
</script>


<style scoped>
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1em 0;
    gap: 6px;
}
.pagination-btn {
    padding: 6px 14px;
    margin: 0 1px;
    border: 1px solid #d0d0d0;
    background: #f5f5f5;
    color: #333;
    border-radius: 5px;
    font-size: 1em;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}
.pagination-btn:hover:not(:disabled) {
    background: #e0e7ff;
    color: #1d4ed8;
}
.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.pagination-current {
    background: #2563eb;
    color: #fff;
    font-weight: bold;
    border: 1px solid #2563eb;
}
</style>