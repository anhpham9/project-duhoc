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
                <div v-if="showNotifications" :class="[{ 'show': showNotifications }]" class="notification-dropdown">
                    <div class="notification-header">
                        <div class="notification-dropdown-title">
                            <i class="fas fa-bell"></i>
                            <span>Thông báo (<span id="notificationCount" style="display: inline-block;">{{ unreadCount
                            }}</span>)</span>
                        </div>
                        <span>Thông báo ({{ unreadCount }})</span>
                        <button v-if="unreadNotifications.length" class="mark-all-btn" @click="markAllAsRead"
                            title="Đánh dấu tất cả đã đọc">
                            <i class="fas fa-check-double"></i>
                        </button>
                    </div>
                    <div v-if="unreadNotifications.length === 0" class="notification-empty">Không có thông báo mới</div>
                    <div class="notification-body" v-else>
                        <div v-for="n in unreadNotifications" :key="n.id" class="notification-item unread">
                            <div class="notification-icon" :class="`type-${n.type}`">
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
                                <div class="notification-title">
                                    <h4>{{ n.title }}</h4>
                                    <span class="notification-time">{{ formatSmartDate(n.created_at) }}</span>
                                </div>
                                <div class="notification-message">{{ n.message }}</div>
                            </div>
                            <div class="notification-actions">
                                <button class="icon-btn mark-read-btn" @click="markAsRead(n.id)"
                                    title="Đánh dấu đã đọc">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="icon-btn notification-action-btn" @click="viewDetail(n)"
                                    title="Xem chi tiết">
                                    <i class="fas fa-external-link-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="notification-footer">
                        <a href="/admin/notifications" class="view-all-link">
                            <i class="fas fa-external-link-alt"></i> Xem tất cả thông báo
                        </a>
                    </div>
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
            <span class="last-login">Lần cuối đăng nhập: <b>{{ formatSmartDate(user.last_login) }}</b></span>
        </div>
    </header>
    <div v-if="showDetail && detailNotification" class="modal notification-detail-modal">
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-title">{{ detailNotification.title }}</span>
                <button class="modal-close" @click="closeDetail">&times;</button>
            </div>
            <div class="modal-body">
                <div><b>Thời gian:</b> {{ formatSmartDate(detailNotification.created_at) }}</div>
                <div><b>Nội dung:</b> {{ detailNotification.message }}</div>
                <div v-if="detailNotification.entity_type"><b>Bảng liên quan:</b> {{ detailNotification.entity_type }}
                </div>
                <div v-if="detailNotification.entity_id"><b>ID:</b> {{ detailNotification.entity_id }}</div>
                <div v-if="detailNotification.data"><b>Dữ liệu thêm:</b> {{ detailNotification.data }}</div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" @click="closeDetail">Đóng</button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCookie } from '#imports'
import { formatSmartDate } from '~/utils/date'
import fetchWithRefresh from '~/utils/fetchWithRefresh'

const currentUser = useCookie('currentUser', { default: () => null })
const user = computed(() => currentUser.value)

// Redirect nếu chưa đăng nhập
onMounted(() => {
    // console.log('[AdminHeader] user:', user.value, 'currentUser:', currentUser.value)
    if (!user.value) window.location.href = '/login'
    fetchUnreadCount()
    fetchUnreadNotifications()
})

const unreadCount = ref(0)
const unreadNotifications = ref([])

async function fetchUnreadCount() {
    try {
        const res = await fetchWithRefresh('/api/notifications/unread-count')
        unreadCount.value = res.count || 0
    } catch (e) {
        unreadCount.value = 0
    }
}

async function fetchUnreadNotifications() {
    try {
        const res = await fetchWithRefresh('/api/notifications/unread-list')
        unreadNotifications.value = res.notifications || []
    } catch (e) {
        unreadNotifications.value = []
    }
}

async function markAsRead(id) {
    try {
        await fetchWithRefresh(`/api/notifications/${id}/read`, { method: 'PUT' })
        fetchUnreadCount()
        fetchUnreadNotifications()
    } catch { }
}

async function markAllAsRead() {
    // Đánh dấu tất cả tin chưa đọc (gọi tuần tự từng tin)
    await Promise.all(unreadNotifications.value.map(n => markAsRead(n.id)))
    fetchUnreadCount()
    fetchUnreadNotifications()
}

const showDetail = ref(false)
const detailNotification = ref(null)

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
function viewDetail(n) {
    detailNotification.value = n
    showDetail.value = true
}

function closeDetail() {
    showDetail.value = false
    detailNotification.value = null
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
    top: calc(100% + 10px);
    right: 0;
    width: 380px;
    max-height: 500px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid #e8e8e8;
    z-index: 10000;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

.notification-dropdown.show {
    opacity: 1;
    transform: translateY(0);
}

.notification-item {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.notification-item.unread {
    background: #f0f8ff;
    border-left: 3px solid #007bff;
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-empty {
    padding: 1em;
    color: #888;
    text-align: center;
}

.notification-header {
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.notification-dropdown-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.notification-dropdown-title i {
    color: #007bff;
}

.mark-all-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.notification-body {
    max-height: 360px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #ddd #f8f9fa;
}

.notification-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.notification-content {
    flex: 1;
    min-width: 0;
}

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

.notification-title {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
    gap: 8px;
}

.notification-title h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    line-height: 1.3;
}

.notification-time {
    font-size: 0.75rem;
    color: #666;
    white-space: nowrap;
    flex-shrink: 0;
}

.notification-message {
    font-size: 0.85rem;
    color: #555;
    line-height: 1.4;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.notification-item:hover .notification-actions {
    opacity: 1;
}

.notification-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.icon-btn {
    background: none;
    border: none;
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
    color: #666;
    font-size: 0.8rem;
    transition: all 0.3s ease;
}

.mark-read-btn:hover {
    background: #28a745;
    color: white;
}

.notification-action-btn:hover {
    background: #007bff;
    color: white;
}

.notification-footer {
    padding: 12px 20px;
    background: #f8f9fa;
    border-top: 1px solid #e8e8e8;
    text-align: center;
}

.view-all-link {
    color: #007bff;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s ease;
}

.view-all-link:hover {
    color: #0056b3;
    text-decoration: underline;
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

@media screen and (max-width: 480px) {
    .notification-dropdown {
        position: fixed;
        top: 60px;
        left: 50%;
        transform: translate(-50%, -10px);

        width: calc(100% - 20px);
        max-width: 480px;

        opacity: 0;
        transition: 0.3s;
    }

    .notification-dropdown.show {
        transform: translate(-50%, 0);
        opacity: 1;
    }

    .notification-header,
    .notification-footer {
        padding: 12px 16px;
    }

    .notification-body {
        max-height: 300px;
    }

    .notification-item {
        padding: 12px 16px;
    }
}
</style>