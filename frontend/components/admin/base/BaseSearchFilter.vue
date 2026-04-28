<template>
    <div class="filter-search">
        <input class="search-input" v-model="search" @input="onInput" type="text" placeholder="Tìm kiếm..." />
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
const props = defineProps({
    modelValue: String
})
const emit = defineEmits(['update:search', 'update:modelValue'])
const search = ref(props.modelValue || '')
watch(() => props.modelValue, v => search.value = v)

function onInput() {
    emit('update:search', search.value)
    emit('update:modelValue', search.value)
}
</script>

<style scoped>
.search-input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-width: 300px;
}

.search-input:hover,
.search-input:focus {
    border-color: #888;
    outline: none;
}

@media (max-width: 768px) {
    .filter-search {
        flex: 0 0 100%;
    }

    .search-input {
        width: 100%;
        min-width: unset;
    }
}
</style>