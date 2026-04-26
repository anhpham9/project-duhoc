// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: false },
    vite: {
        optimizeDeps: {
            include: []
        },
        server: {
            proxy: {
                '/api': {
                    target: 'http://localhost:5000', // Địa chỉ backend thực tế
                    changeOrigin: true,
                    // rewrite: path => path.replace(/^\/api/, '')
                }
            }
        }
    },
    runtimeConfig: {
        public: {
            apiBase: "http://localhost:5000/api"
        }
    }
})