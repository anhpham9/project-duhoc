<template>
    <header class="main-header">
        <h1>Admin Dashboard</h1>
        <div v-if="user">
            <span>Xin chào: <b>{{ user.name }}</b></span>
            <span style="margin-left:16px;">Lần cuối đăng nhập: <b>{{ lastLoginText }}</b></span>
        </div>
    </header>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';

const user = ref(null);
const lastLoginText = computed(() => {
    if (!user.value?.last_login) return 'Chưa có';
    const d = new Date(user.value.last_login);
    return d.toLocaleString();
});

onMounted(async () => {
    try {
        const res = await $fetch('/api/auth/me', { credentials: 'include' });
        user.value = res.user;
    } catch (e) {
        user.value = null;
    }
});
</script>