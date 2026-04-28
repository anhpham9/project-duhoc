// middleware/guest.js
// Nếu đã đăng nhập thì redirect về /admin khi truy cập /login
export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.server) return;
    if (to.path !== '/login') return;
    try {
        await $fetch('/api/auth/me', { credentials: 'include' });
        console.log('[guest middleware] User is authenticated, redirecting to /admin');
        // Nếu gọi /me thành công, đã đăng nhập, redirect về /admin
        return navigateTo('/admin');
    } catch (err) {
        // Nếu chưa đăng nhập thì cho vào login bình thường
        console.log('[guest middleware] User is not authenticated, redirecting to /login');
        return;
    }
});
