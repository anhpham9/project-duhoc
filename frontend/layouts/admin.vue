<template>
    <div class="admin-layout">
        <div v-if="isAdminRoute">
            <div v-if="loading" class="loading">loading...</div>
            <template v-else>
                <AdminHeader />
                <AdminSidebar />
                <slot />
            </template>
        </div>
        <div v-else>
            <slot />
        </div>
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
        const res = await $fetch('/api/auth/me', { credentials: 'include' })
        currentUser.value = res // Đảm bảo có trường permissions
    } catch {
        currentUser.value = null
        // Nếu chưa đăng nhập, sẽ bị middleware chuyển hướng
    } finally {
        loading.value = false
    }
}

onMounted(checkAuth)
watch(() => route.path, checkAuth)
</script>

<style scoped>
.loading {
    text-align: center;
    padding: 3em 0;
    font-size: 1.2em;
    color: #1976d2;
}
</style>
