<template>
    <div class="permission-tree">
        <input v-model="search" placeholder="Tìm kiếm chức năng..." class="search-box" />
        <ul>
            <li :key="group.code" v-for="group in filteredTree">
                <b>{{ group.label }}</b>
                <ul>
                    <li v-for="perm in group.children" :key="perm.id">
                        <label v-if="!perm.actions || perm.actions.length === 0">
                            <input type="checkbox" :value="perm.id" v-model="localValue" />
                            {{ perm.label }}
                        </label>
                        <template v-else-if="perm.actions.length === 1">
                            <label>
                                <input type="checkbox" :value="perm.actions[0].fullCode" v-model="localValue" />
                                {{ perm.actions[0].label }}
                            </label>
                        </template>
                        <template v-else>
                            <span>{{ perm.label }}</span>
                            <span v-for="action in perm.actions" :key="action.code" class="action-checkbox">
                                <input type="checkbox" :value="action.fullCode" v-model="localValue" />
                                {{ action.label }}
                            </span>
                        </template>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
const props = defineProps({
    tree: Array,
    modelValue: Array
})
const emit = defineEmits(['update:modelValue'])
const search = ref('')
// Dùng biến tạm cho v-model
const localValue = ref([...props.modelValue])
watch(() => props.modelValue, v => {
    localValue.value = [...v]
})
watch(localValue, v => {
    if (JSON.stringify(v) !== JSON.stringify(props.modelValue)) {
        emit('update:modelValue', v)
    }
})
const filteredTree = computed(() => {
    if (!search.value) return props.tree
    const lower = search.value.toLowerCase()
    return props.tree
        .map(group => ({
            ...group,
            children: group.children.filter(perm =>
                perm.label.toLowerCase().includes(lower) ||
                (perm.actions || []).some(a => a.label.toLowerCase().includes(lower))
            )
        }))
        .filter(group => group.children.length)
})
</script>
<style scoped>
.permission-tree {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 1em;
    background: #fafbfc;
    max-width: 500px;
}

.search-box {
    width: 100%;
    margin-bottom: 0.5em;
    padding: 0.5em;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.action-checkbox {
    margin-left: 1em;
    font-size: 0.95em;
}
</style>