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

definePageMeta({ layout: "empty", middleware: 'guest', ssr: false });

const username = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

const onLogin = async () => {
    error.value = '';
    try {
        // console.log('Attempting login with:', username.value, password.value);
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { username: username.value, password: password.value },
            credentials: 'include',
        });
        // Sau khi login thành công, lấy user và set cookie
        const user = await $fetch('/api/auth/me', { credentials: 'include' });
        if (typeof useCookie === 'function') {
            const currentUser = useCookie('currentUser');
            currentUser.value = user;
        }
        router.push('/admin');
    } catch (err) {
        error.value = err?.data?.message || 'Đăng nhập thất bại';
    }
};
</script>

<style scoped>
.login-page {
    max-width: 400px;
    margin: 80px auto;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(44,62,80,0.08), 0 1.5px 4px rgba(44,62,80,0.04);
    padding: 36px 32px 28px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
}
form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 18px;
}
input[type="text"], input[type="password"] {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #dbe2ef;
    border-radius: 6px;
    font-size: 1em;
    background: #f7fafc;
    transition: border 0.2s, box-shadow 0.2s;
    outline: none;
}
input[type="text"]:focus, input[type="password"]:focus {
    border-color: #1976d2;
    background: #fff;
    box-shadow: 0 0 0 2px #1976d220;
}
button[type="submit"] {
    width: 100%;
    padding: 12px 0;
    background: #1976d2;
    color: #fff;
    font-size: 1.08em;
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.18s;
    margin-top: 8px;
}
button[type="submit"]:hover {
    background: #1256a3;
}
.error {
    color: #e74c3c;
    margin-top: 8px;
    font-size: 0.98em;
    text-align: center;
}
@media (max-width: 600px) {
    .login-page {
        max-width: 98vw;
        padding: 18px 6vw 18px 6vw;
        margin: 32px auto;
    }
}
</style>