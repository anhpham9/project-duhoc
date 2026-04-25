<template>
    <div class="login-page">
        <form @submit.prevent="onLogin">
            <input v-model="username" type="text" placeholder="Username" required />
            <input v-model="password" type="password" placeholder="Password" required />
            <button type="submit">Đăng nhập</button>
            <div v-if="error" class="error">{{ error }}</div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({ layout: "empty", middleware: 'guest' });

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const onLogin = async () => {
    error.value = '';
    try {
        console.log('Attempting login with:', username.value, password.value);
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { username: username.value, password: password.value },
            credentials: 'include',
        });
        console.log('Login successful, redirecting to /admin');

        router.push('/admin');
    } catch (err) {
        error.value = err?.data?.message || 'Đăng nhập thất bại';
    }
};
</script>

<style scoped>
.login-page { max-width: 400px; margin: 60px auto; }
.error { color: red; margin-top: 10px; }
</style>