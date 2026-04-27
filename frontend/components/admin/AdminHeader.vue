<template>
    <header class="main-header">
        <h1>Admin Dashboard</h1>
        <div v-if="user">
            <span>Xin chào: <b>{{ user.name }}</b></span>
            <span style="margin-left:16px;">Lần cuối đăng nhập: <b>{{ lastLoginText }}</b></span>
            <button @click="onLogout">Đăng xuất</button>
        </div>
        <div v-else>
            <a href="/login">Đăng nhập</a>
        </div>
    </header>
</template>
<script setup>
import { computed } from 'vue'
import { useCookie } from '#imports'
const currentUser = useCookie('currentUser', { default: () => null })
const user = computed(() => currentUser.value)
const lastLoginText = computed(() => {
    if (!user.value?.last_login) return 'Chưa có';
    const d = new Date(user.value.last_login);
    return d.toLocaleString();
})
const onLogout = async () => {
    try {
        await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        currentUser.value = null
        window.location.reload();
        return navigateTo('/login');
    } catch (e) {
        alert('Đăng xuất thất bại!');
    }
};
</script>