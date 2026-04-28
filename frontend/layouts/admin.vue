
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
    padding: 32px 32px 32px 32px;
    background: #f9f9f9;
    min-height: calc(100vh - 60px);
    overflow-x: auto;
    position: relative;
}

@media (max-width: 768px) {
    .admin-main {
        flex-direction: column;
        min-height: calc(100vh - 50px);
    }
    .admin-content {
        padding: 16px 6px 16px 6px;
        min-height: calc(100vh - 50px);
    }
}

/* Loading overlay */
.admin-loading-overlay {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255,255,255,0.85);
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.admin-loading-text {
    color: #1976d2;
    font-size: 1.1em;
    font-weight: 500;
    letter-spacing: 0.5px;
}
</style>
