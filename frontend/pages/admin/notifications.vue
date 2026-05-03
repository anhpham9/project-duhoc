<template>
    <div class="notifications-page">
        <BaseToast ref="toastRef" />
        <div class="container">
            <h1 class="page-title">Thông báo của bạn</h1>
            <div class="page-actions">
                <div class="tabs">
                    <button class="tab-btn" :class="{ active: filter === 'unread' }" @click="setFilter('unread')">Chưa
                        xem</button>
                    <button class="tab-btn" :class="{ active: filter === 'all' }" @click="setFilter('all')">Tất
                        cả</button>
                </div>
                <div class="notification-count">
                    <p>Hiển thị {{ (total === 0 ? 0 : ((page - 1) * pageSize + 1)) }} ~ {{ Math.min(page * pageSize,
                        total) }} / {{ total }} thông báo</p>
                </div>
            </div>
            <div v-if="loading" class="loading">Đang tải...</div>
            <div v-else class="notification-list">

                <div v-for="n in notifications" :key="n.id"
                    :class="['notification', `action-${n.action}`, { unread: !n.is_read }]" @click="openDetail(n)">
                    <div :class="['notification-icon', `type-${n.type}`]">
                        <i v-if="n.type === 'system'" class="fa-solid fa-gears"></i>
                        <i v-else-if="n.type === 'page'" class="fa-regular fa-file-lines"></i>
                        <i v-else-if="n.type === 'contact'" class="fa-regular fa-address-book"></i>
                        <i v-else-if="n.type === 'news'" class="fa-regular fa-newspaper"></i>
                        <i v-else-if="n.type === 'schools'" class="fa-solid fa-graduation-cap"></i>
                        <i v-else-if="n.type === 'user'" class="fa-solid fa-user-gear"></i>
                        <i v-else-if="n.type === 'role'" class="fa-solid fa-user-shield"></i>
                        <i v-else-if="n.type === 'file'" class="fa-solid fa-paperclip"></i>
                        <i v-else-if="n.type === 'warning'" class="fa-solid fa-triangle-exclamation"></i>
                        <i v-else-if="n.type === 'success'" class="fa-solid fa-circle-check"></i>
                        <i v-else-if="n.type === 'error'" class="fa-solid fa-circle-xmark"></i>
                        <i v-else class="fa-regular fa-bell"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-title">{{ n.title }}</div>
                        <div class="notification-message">{{ n.message }}</div>
                    </div>
                    <div class="notification-status">
                        <div class="notification-time">{{ formatSmartDate(n.created_at) }}</div>
                        <span class="status-icon" :class="{ unread: !n.is_read }"></span>
                    </div>
                </div>

                <!-- Modal xem chi tiết thông báo -->
                <div v-if="showDetail" class="modal">
                    <div class="modal-content">
                        <h3>{{ detailNotification?.title }}</h3>
                        <span>{{ formatSmartDate(detailNotification?.created_at) }}</span>
                        <div class="detail-content">
                            <div class="form-group">
                                <p class="detail-title">Nội dung:</p>
                                <p class="detail-info">{{ detailNotification?.message }}</p>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <p class="detail-title">Phân loại:</p>
                                    <p class="detail-info">{{ detailNotification?.type }}</p>
                                </div>
                                <div class="form-group">
                                    <p class="detail-title">Thao tác:</p>
                                    <p class="detail-info">{{ detailNotification?.action }}</p>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <p class="detail-title">Liên kết bảng CSDL:</p>
                                    <p class="detail-info">{{ detailNotification?.entity_type }}</p>
                                </div>
                                <div class="form-group">
                                    <p class="detail-title">ID:</p>
                                    <p class="detail-info">{{ detailNotification?.entity_id }}</p>
                                </div>
                            </div>
                            <div v-if="detailNotification?.data" class="form-group">
                                <p class="detail-title">Dữ liệu thêm:</p>
                                <p class="detail-info">{{ detailNotification.data }}</p>
                            </div>

                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" type="button" @click="closeDetail">Đóng</button>
                        </div>
                    </div>
                </div>

                <div v-if="notifications.length === 0" class="empty">Không có thông báo nào.</div>
            </div>
        </div>
        <BasePagination v-if="totalPages > 1" :model-value="page" :total-pages="totalPages"
            @update:modelValue="setPage" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseToast from '~/components/admin/base/BaseToast.vue'
import BasePagination from '~/components/admin/base/BasePagination.vue'
import { formatDate, formatSmartDate } from '~/utils/date'
import fetchWithRefresh from '~/utils/fetchWithRefresh'

const notifications = ref([])
const loading = ref(false)
const toastRef = ref()
const showDetail = ref(false)
const detailNotification = ref(null)
const filter = ref('unread')
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const pageSize = ref(10)

async function fetchNotifications() {
    loading.value = true
    try {
        let url = `/api/notifications?limit=${pageSize.value}&page=${page.value}`
        if (filter.value === 'unread') url += '&unread=true'
        const res = await fetchWithRefresh(url)
        notifications.value = res.notifications || []
        total.value = res.total || 0
        totalPages.value = res.totalPages || 1
    } catch (e) {
        toastRef.value?.open('Lỗi tải thông báo', 'error')
    } finally {
        loading.value = false
    }
}

async function markAsRead(id) {
    try {
        await fetchWithRefresh(`/api/notifications/${id}/read`, { method: 'PUT' })
        const n = notifications.value.find(n => n.id === id)
        if (n) n.is_read = true
        toastRef.value?.open('Đã đánh dấu đã đọc', 'success')
    } catch (e) {
        toastRef.value?.open('Lỗi đánh dấu đã đọc', 'error')
    }
}

async function openDetail(n) {
    detailNotification.value = n
    showDetail.value = true
    if (!n.is_read) {
        await markAsRead(n.id)
    }
}

function closeDetail() {
    showDetail.value = false
    detailNotification.value = null
    fetchNotifications()
}

function setFilter(val) {
    filter.value = val
    page.value = 1
    fetchNotifications()
}

function setPage(p) {
    page.value = p
    fetchNotifications()
}

onMounted(() => {
    fetchNotifications()
})

definePageMeta({
    layout: 'admin',
    middleware: 'auth',
    ssr: false
})
</script>

<style scoped>
.notifications-page {
    padding: 24px;
}

.page-title {
    font-size: 1.5em;
    margin-bottom: 18px;
}

.notification-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.notification {
    display: flex;
    gap: 12px;
    padding: 14px;
    border-radius: 10px;
    background: #fefefe;
    border: 1px solid #dadada;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    transition: 0.2s;
    color: #e2e2e2;
}

.notification.unread {
    background: #fff;
    border: 1px solid #dadada;
}

.notification:hover {
    transform: translateY(-2px);
}

/* Icon */
.notification-icon {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
    color: #fff;
    background: #e2e2e2;
}

.notification-content {
    /* flex: 1; */
    flex-grow: 1;
}

.notification-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
}

.status-icon {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #e2e2e2;
}

.status-icon.unread {
    background: #e74c3c;
}

/* Content */
.notification-title {
    font-weight: 600;
    font-size: 12px;
    padding-bottom: 5px;
}

.unread .notification-title {
    color: #333;
}

.notification-message {
    font-size: 12px;
    list-style: 16px;
}

.unread .notification-message {
    color: #555;
}

.notification-time {
    font-size: 10px;
}

.unread .notification-time {
    color: #333;
    font-weight: 600;
    font-size: 10px;
    text-align: end;
}

/* Type styles */
.unread .notification-icon.type-system {
    background: #dc2626;
}

.unread .notification-icon.type-page {
    background: #3b82f6;
}

.unread .notification-icon.type-contact {
    background: #8b5cf6;
}

.unread .notification-icon.type-news {
    background: #2563eb;
}

.unread .notification-icon.type-schools {
    background: #14b8a6;
}

.unread .notification-icon.type-user {
    background: #6366f1;
}

.unread .notification-icon.type-role {
    background: #f87171;
}

.unread .notification-icon.type-file {
    background: #f59e0b;
}

.unread .notification-icon.type-warning {
    background: #facc15;
}

.unread .notification-icon.type-success {
    background: #22c55e;
}

.unread .notification-icon.type-error {
    background: #ef4444;
}

/* Modal styles */
.notification-detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.25);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: #fff;
    border-radius: 10px;
    padding: 24px 32px;
    min-width: 320px;
    max-width: 90vw;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.modal-title {
    font-weight: 600;
    font-size: 1.1em;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
    color: #888;
    padding: 0 8px;
}

.modal-body {
    font-size: 15px;
    color: #222;
    line-height: 1.7;
}

/* Tabs */
.page-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1em;
    margin-top: 1em;
}

.tab-btn {
    padding: 10px 24px;
    border: none;
    background: #f5f5f5;
    color: #333;
    border-radius: 8px 8px 0 0;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    outline: none;
}

.tab-btn.active {
    background: #1976d2;
    color: #fff;
    box-shadow: 0 -2px 8px rgba(25, 118, 210, 0.08);
}

.tab-btn:hover:not(.active) {
    background: #e0e7ff;
    color: #1d4ed8;
}

.notification-count {
    font-weight: 600;
}

@media screen and (max-width: 480px) {

    .page-actions {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .tabs {
        width: 100%;
    }

    .tab-btn {
        flex: 1;
    }

    .notification-count {
        align-self: flex-end;
        margin-bottom: 1em;
    }

}
</style>
