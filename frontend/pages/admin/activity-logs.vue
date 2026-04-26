<template>
    <div>
        <h1>Lịch sử hoạt động hệ thống</h1>
        <div class="mb-4">
            <label>User ID: <input v-model="userId" type="text" /></label>
            <label>Action: <input v-model="action" type="text" /></label>
            <button @click="fetchLogs">Lọc</button>
        </div>
        <table border="1" cellpadding="6">
            <thead>
                <tr>
                    <th>Thời gian</th>
                    <th>User</th>
                    <th>Hành động</th>
                    <th>Đối tượng</th>
                    <th>Dữ liệu</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in logs" :key="log.id">
                    <td>{{ formatDate(log.created_at) }}</td>
                    <td>
                        <span v-if="log.User">{{ log.User.name }} ({{ log.User.username }})</span>
                        <span v-else>?</span>
                    </td>
                    <td>{{ log.action }}</td>
                    <td>{{ log.object_type || '' }}{{ log.object_id ? ' #' + log.object_id : '' }}</td>
                    <td>
                        <pre
                            style="max-width:300px;white-space:pre-wrap;">{{ log.data ? JSON.stringify(log.data, null, 2) : '' }}</pre>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="mt-4">
            <button :disabled="page === 1" @click="page--">Trang trước</button>
            <span>Trang {{ page }}</span>
            <button :disabled="logs.length < pageSize" @click="page++">Trang sau</button>
        </div>
    </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const logs = ref([])
const userId = ref('')
const action = ref('')
const page = ref(1)
const pageSize = 20

async function fetchLogs() {
    const params = new URLSearchParams()
    if (userId.value) params.append('user_id', userId.value)
    if (action.value) params.append('action', action.value)
    params.append('limit', pageSize)
    params.append('offset', (page.value - 1) * pageSize)
    // Sử dụng đường dẫn tương đối, backend phải proxy hoặc CORS đúng
    const API_BASE = 'http://localhost:5000'
    const res = await fetch(`${API_BASE}/api/activity-logs?${params.toString()}`, { credentials: 'include' })

    // const res = await fetch(`/api/activity-logs?${params.toString()}`, { credentials: 'include' })
    const data = await res.json()
    logs.value = data.logs || []
}

watch([page], fetchLogs, { immediate: true })

function formatDate(dt) {
    return dt ? new Date(dt).toLocaleString() : ''
}

definePageMeta({
    layout: "admin",
    middleware: 'auth',
    ssr: false,
});

</script>
<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 6px;
}
</style>
