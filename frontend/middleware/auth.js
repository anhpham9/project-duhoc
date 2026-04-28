// middleware/auth.js (Nuxt 3/4)
// Tự động redirect về /login nếu chưa đăng nhập khi vào /admin/*
export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return; // Chỉ chạy phía client để luôn có cookie
    if (!to.path.startsWith('/admin')) return;
    try {
        // Gọi API backend để kiểm tra đăng nhập (cookie HttpOnly sẽ tự gửi)
        await $fetch('/api/auth/me', { credentials: 'include' });
        console.log('[auth middleware] User is authenticated, allowing access to admin');
    } catch (err) {
        // Nếu lỗi 401, thử refresh token
        if (err?.response?.status === 401) {
            try {
                await $fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
                // Sau khi refresh thành công, thử lại /me
                await $fetch('/api/auth/me', { credentials: 'include' });
                console.log('[auth middleware] Token refreshed successfully, user is authenticated');
                return; // Đã refresh thành công, cho vào admin
            } catch (refreshErr) {
                // Nếu refresh cũng lỗi, chuyển về login
                return navigateTo('/login');
            }
        } else {
            return navigateTo('/login');
        }
    }
});
