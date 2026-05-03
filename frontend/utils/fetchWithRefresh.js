// utils/fetchWithRefresh.js
// Interceptor $fetch tự động refresh token khi gặp 401 cho Nuxt 3/4

export default async function fetchWithRefresh(url, opts = {}) {
    try {
        return await $fetch(url, { ...opts, credentials: 'include' })
    } catch (err) {
        // Nếu lỗi 401 và không phải gọi refresh chính nó
        if (err?.response?.status === 401 && !url.includes('/auth/refresh')) {
            try {
                await $fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
                // Retry lại request cũ
                return await $fetch(url, { ...opts, credentials: 'include' })
            } catch (refreshErr) {
                // Nếu refresh cũng lỗi, logout hoặc chuyển về login
                if (process.client) {
                    window.location.href = '/login'
                }
                throw refreshErr
            }
        }
        throw err
    }
}
