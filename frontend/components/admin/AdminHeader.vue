<template>
    <header class="main-header">
        <h1 class="header-title">Admin Panel</h1>
        <div class="header-actions">
            <div class="notification-wrapper">
                <button class="notification-btn" @click="toggleNotifications" aria-label="Thông báo">
                    <svg class="bell-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
                </button>
                <div v-if="showNotifications" class="notification-dropdown">
                    <div v-if="unreadNotifications.length === 0" class="notification-empty">Không có thông báo mới</div>
                    <ul v-else>
                        <li v-for="n in unreadNotifications" :key="n.id" class="notification-item">
                            {{ n.text }}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="user-menu-wrapper">
                <button class="user-btn" @click="toggleUserMenu">
                    <span class="user-name">{{ user.name || 'Tài khoản' }}</span>
                    <svg class="user-caret" width="16" height="16" viewBox="0 0 20 20">
                        <path fill="currentColor"
                            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z" />
                    </svg>
                </button>
                <div v-if="showUserMenu" class="user-menu-dropdown">
                    <a href="/admin/profile" class="user-menu-item">Thông tin cá nhân</a>
                    <button class="user-menu-item" @click="onLogout">Đăng xuất</button>
                </div>
            </div>
            <span class="last-login">Lần cuối đăng nhập: <b>{{ lastLoginText }}</b></span>
        </div>
    </header>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCookie } from '#imports'
const currentUser = useCookie('currentUser', { default: () => null })
const user = computed(() => currentUser.value)
const lastLoginText = computed(() => {
    if (!user.value?.last_login) return 'Chưa có';
    const d = new Date(user.value.last_login);
    return d.toLocaleString();
})

// Redirect nếu chưa đăng nhập
onMounted(() => {
    console.log('[AdminHeader] user:', user.value, 'currentUser:', currentUser.value)
    if (!user.value) window.location.href = '/login'
})

// Thông báo mẫu (sau này thay bằng API)
const unreadNotifications = ref([
    { id: 1, text: 'Bạn có 1 yêu cầu mới' },
    { id: 2, text: 'Tài khoản vừa được cập nhật' }
])
const unreadCount = computed(() => unreadNotifications.value.length)
const showNotifications = ref(false)
const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value
    showUserMenu.value = false
}

const showUserMenu = ref(false)
const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
    showNotifications.value = false
}

const onLogout = async () => {
    try {
        await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        currentUser.value = null
        window.location.reload();
        return navigateTo('/login');
    } catch (e) {
        alert('Đăng xuất thất bại!');
    }
}
</script>
<style scoped>
/* Header layout */
.main-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5em 1em;
    background: #2c3e50;
    color: #ecf0f1;
    position: relative;
    z-index: 100;
    height: 60px;
}

.header-title {
    font-size: 1.3em;
    font-weight: 600;
    margin-right: 1.5em;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1.5em;
}

.notification-wrapper {
    position: relative;
}

.notification-btn {
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
    padding: 0;
    margin-right: 0.5em;
}

.bell-icon {
    color: #ecf0f1;
    width: 24px;
    height: 24px;
}

.notification-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #e74c3c;
    color: #fff;
    border-radius: 50%;
    font-size: 0.8em;
    padding: 2px 6px;
    min-width: 18px;
    text-align: center;
    font-weight: bold;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.notification-dropdown {
    position: absolute;
    right: 0;
    top: 32px;
    background: #fff;
    color: #222;
    min-width: 220px;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.13);
    padding: 0.5em 0;
    z-index: 200;
}

.notification-item {
    padding: 0.5em 1em;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.98em;
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-empty {
    padding: 1em;
    color: #888;
    text-align: center;
}

.user-menu-wrapper {
    position: relative;
}

.user-btn {
    background: none;
    border: none;
    color: #ecf0f1;
    font-weight: 500;
    font-size: 1em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3em;
    padding: 0.2em 0.5em;
    border-radius: 4px;
    transition: background 0.15s;
}

.user-btn:hover {
    background: #34495e;
}

.user-caret {
    margin-left: 2px;
    color: #ecf0f1;
}

.user-menu-dropdown {
    position: absolute;
    right: 0;
    top: 32px;
    background: #fff;
    color: #222;
    min-width: 160px;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.13);
    padding: 0.5em 0;
    z-index: 200;
    display: flex;
    flex-direction: column;
}

.user-menu-item {
    padding: 0.5em 1em;
    background: none;
    border: none;
    color: #222;
    text-align: left;
    font-size: 1em;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s;
}

.user-menu-item:hover {
    background: #f0f0f0;
}

.user-name {
    font-weight: 600;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.last-login {
    font-size: 0.95em;
    color: #bfc9d1;
    margin-left: 1em;
}

@media screen and (max-width: 768px) {
    .main-header {
        justify-content: end;
        height: 50px;
    }

    .header-title {
        display: none;
    }

    .last-login {
        display: none;
    }
}
</style>