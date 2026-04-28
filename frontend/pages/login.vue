<template>
    <div class="login-wrapper">
        <BaseToast ref="toastRef" />
        <div class="login-card">
            <div class="login-header">
                <div class="logo-container">
                    <img src="/logo02.png" alt="Du Học NB" class="login-logo">
                </div>
                <h1>Đăng Nhập Quản Trị</h1>
            </div>

            <form class="login-form" id="loginForm" @submit.prevent="onLogin">
                <div class="form-group">
                    <label for="username" hidden>Tên đăng nhập</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input v-model="username" type="text" id="username" name="username" placeholder="Nhập tên đăng nhập" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="password" hidden>Mật khẩu</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" name="password" placeholder="Nhập mật khẩu" required autocomplete="off">
                        <button type="button" class="toggle-password" @click="togglePassword">
                            <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                        </button>
                    </div>
                </div>

                <div class="form-options">
                    <div class="remember-me">
                        <input v-model="rememberMe" type="checkbox" id="remember" name="remember">
                        <label for="remember">Ghi nhớ đăng nhập</label>
                    </div>
                    <a href="#" class="forgot-password">Quên mật khẩu?</a>
                </div>

                <button type="submit" class="login-btn">
                    <i class="fas fa-sign-in-alt"></i>
                    Đăng Nhập
                </button>
            </form>

            <div class="login-footer">
                <p>&copy; 2024 Du Học NB. Bảo mật và an toàn.</p>
                <div class="security-info">
                    <i class="fas fa-shield-alt"></i>
                    <span>Hệ thống được bảo mật SSL</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({ layout: "empty", middleware: 'guest', ssr: false });

const username = ref('');
const password = ref('');
const error = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const router = useRouter();

import BaseToast from '~/components/admin/base/BaseToast.vue'
import { ref as vueRef } from 'vue'
const toastRef = vueRef()
function showToast(message, type = 'error', duration = 30000) {
    toastRef.value?.open(message, type, duration)
}

// Tự động điền username nếu đã lưu
if (typeof window !== 'undefined') {
    const remembered = localStorage.getItem('rememberedUsername');
    if (remembered) {
        username.value = remembered;
        rememberMe.value = true;
    }
}

const togglePassword = () => {
    showPassword.value = !showPassword.value;
};

const onLogin = async () => {
    error.value = '';
    try {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { username: username.value, password: password.value, rememberMe: rememberMe.value },
            credentials: 'include',
        });
        // Sau khi login thành công, lấy user và set cookie
        const user = await $fetch('/api/auth/me', { credentials: 'include' });
        if (typeof useCookie === 'function') {
            const currentUser = useCookie('currentUser');
            currentUser.value = user;
            // Nếu rememberMe, lưu username vào localStorage
            if (rememberMe.value) {
                localStorage.setItem('rememberedUsername', username.value);
            } else {
                localStorage.removeItem('rememberedUsername');
            }
        }
        showToast('Đăng nhập thành công!', 'success');
        setTimeout(() => router.push('/admin'), 800);
    } catch (err) {
        if (err?.data?.message === 'LOGIN_ACCOUNT_INACTIVE') {
            showToast('Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt. Vui lòng liên hệ quản trị viên.', 'error');
        } else {
            showToast('Đăng nhập thất bại. Vui lòng kiểm tra lại!', 'error');
        }
    }
};
</script>

<style scoped>
</style>