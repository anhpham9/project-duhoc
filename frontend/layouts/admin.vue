<template>
    <div class="admin-layout">
        <template v-if="isAdminRoute">
            <AdminHeader />
            <div class="admin-main">
                <AdminSidebar />
                <main class="admin-content">
                    <div v-if="loading" class="admin-loading-overlay">
                        <div class="admin-loading-spinner"></div>
                        <div class="admin-loading-text">Đang xác thực...</div>
                    </div>
                    <slot v-else />
                </main>
            </div>
        </template>
        <template v-else>
            <slot />
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useCookie } from '#imports'
import { useRoute } from 'vue-router'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
const loading = ref(true)
const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const currentUser = useCookie('currentUser', { default: () => null })

const checkAuth = async () => {
    if (!isAdminRoute.value) {
        loading.value = false
        return
    }
    loading.value = true
    try {
        // Luôn lấy dữ liệu mới từ server, không dùng cache
        const res = await $fetch('/api/auth/me', {
            credentials: 'include',
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        })
        // Đồng bộ lại cookie currentUser với user trả về
        if (res && typeof useCookie === 'function') {
            const cookie = useCookie('currentUser')
            cookie.value = res
        }
        currentUser.value = res
        // console.log('[AdminLayout] Authenticated user:', currentUser.value)
    } catch {
        currentUser.value = null
        if (typeof useCookie === 'function') {
            const cookie = useCookie('currentUser')
            cookie.value = null
        }
        // console.warn('[AdminLayout] Not authenticated, redirecting to login')
        // Nếu chưa đăng nhập, sẽ bị middleware chuyển hướng
    } finally {
        loading.value = false
    }
}

onMounted(checkAuth)
watch(() => route.path, checkAuth)
</script>


<style>
.admin-layout {
    min-height: 100vh;
    background: #f5f6fa;
}

.admin-main {
    display: flex;
    min-height: calc(100vh - 60px);
}

.admin-content {
    flex: 1;
    padding: 20px;
    background: #f9f9f9;
    min-height: calc(100vh - 60px);
    overflow-x: auto;
    position: relative;
}

/* Loading overlay */
.admin-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    z-index: 2000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.admin-loading-spinner {
    width: 48px;
    height: 48px;
    border: 5px solid #e0e0e0;
    border-top: 5px solid #1976d2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 18px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.admin-loading-text {
    color: #1976d2;
    font-size: 1.1em;
    font-weight: 500;
    letter-spacing: 0.5px;
}

/* modal form */

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    min-width: 600px;
}

.modal-content h3 {
    text-align: center;
    margin-bottom: 20px;
}

/* Container form (nếu nằm trong modal/card) */
.create-form,
.detail-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Group */
.form-group {
    display: flex;
    flex-direction: column;
}

/* Label */
.form-group>label:first-child,
.detail-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #333;
}

/* Input + Select */
.form-group input,
.form-group select,
.detail-info {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    outline: none;
    font-size: 14px;
    line-height: 20px;
    transition: all 0.2s ease;
}
.detail-info {
    background: #f9f9f9;
    color: #555;
    border: 1px solid #eee;
}

/* Focus */
.form-group input:focus,
.form-group select:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

/* Checkbox group */
.form-group label input[type="checkbox"] {
    margin-right: 6px;
}

/* Row (2 cột) */
.form-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.form-row .form-group {
    flex: 1 1 200px;
}

/* Rules */
.form-rules {
    flex: 0 0 100%;
}

.rules-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #333;
}

.form-rules ul {
    margin-left: 20px;
    color: #555;
    list-style: none;
    padding: 0;
}

.rules-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
    font-size: 12px;
    color: #b71c1c;
}

.rules-list li.pass {
    color: #388e3c;
}

.rules-list i.pass {
    color: #388e3c;
}

.rules-list i.fail {
    color: #b71c1c;
}

@media (max-width: 768px) {
    .admin-main {
        flex-direction: column;
        min-height: calc(100vh - 50px);
    }

    .admin-content {
        padding: 10px;
        min-height: calc(100vh - 50px);
    }
}
</style>
