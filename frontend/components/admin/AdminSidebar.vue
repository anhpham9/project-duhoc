<template>
    <div class="admin-sidebar">
        <button class="sidebar-hamburger" @click="sidebarOpen = true" aria-label="Mở menu"
            v-if="!sidebarOpen && isMobile">
            <span class="hamburger-icon"></span>
        </button>
        <div :class="['sidebar-content', { open: sidebarOpen }]">
            <button class="sidebar-close" @click="sidebarOpen = false" aria-label="Đóng menu"
                v-if="sidebarOpen && isMobile">
                ×
            </button>
            <h2 class="sidebar-title">Admin Panel</h2>
            <ul>
                <li><a href="/admin" :class="{ active: isActive('/admin') }">Dashboard</a></li>
                <li v-if="hasPermission('user.manage')"><a href="/admin/users"
                        :class="{ active: isActive('/admin/users') }">Users</a></li>
                <li v-if="hasPermission('contact.manage')"><a href="/admin/contacts"
                        :class="{ active: isActive('/admin/contacts') }">Liên hệ</a></li>
                <li v-if="hasPermission('activity_logs.view')"><a href="/admin/activity-logs"
                        :class="{ active: isActive('/admin/activity-logs') }">Activity Logs</a></li>

                <!-- Trường học -->
                <li>
                    <button class="sidebar-group-btn" @click="toggleGroup('school')">
                        Trường học
                        <span class="caret" :class="{ open: openGroups.school }">▶</span>
                    </button>
                    <ul v-show="openGroups.school" class="sidebar-sub">
                        <li v-if="hasPermission('schools.manage')"><a href="/admin/schools"
                                :class="{ active: isActive('/admin/schools') }">Danh sách</a></li>
                        <li v-if="hasPermission('reviews.manage')"><a href="/admin/school_reviews"
                                :class="{ active: isActive('/admin/school_reviews') }">Nhận xét</a></li>
                        <li v-if="hasPermission('school_types.manage')"><a href="/admin/school_types"
                                :class="{ active: isActive('/admin/school_types') }">Loại trường</a></li>
                        <li v-if="hasPermission('regions.manage')"><a href="/admin/regions"
                                :class="{ active: isActive('/admin/regions') }">Khu vực</a></li>
                    </ul>
                </li>

                <!-- Tin tức -->
                <li>
                    <button class="sidebar-group-btn" @click="toggleGroup('news')">
                        Tin tức
                        <span class="caret" :class="{ open: openGroups.news }">▶</span>
                    </button>
                    <ul v-show="openGroups.news" class="sidebar-sub">
                        <li v-if="hasPermission('news.manage')"><a href="/admin/news"
                                :class="{ active: isActive('/admin/news') }">Danh sách</a></li>
                        <li v-if="hasPermission('categories.manage')"><a href="/admin/categories"
                                :class="{ active: isActive('/admin/categories') }">Phân loại</a></li>
                    </ul>
                </li>

                <!-- Trang -->
                <li>
                    <button class="sidebar-group-btn" @click="toggleGroup('page')">
                        Trang
                        <span class="caret" :class="{ open: openGroups.page }">▶</span>
                    </button>
                    <ul v-show="openGroups.page" class="sidebar-sub">
                        <li v-if="hasPermission('static_pages.manage')"><a href="/admin/static_pages"
                                :class="{ active: isActive('/admin/static_pages') }">Meta SEO</a></li>
                        <li v-if="hasPermission('page_contents.manage')"><a href="/admin/page_contents"
                                :class="{ active: isActive('/admin/page_contents') }">Nội dung</a></li>
                    </ul>
                </li>

                <!-- Thông báo -->
                <li>
                    <button class="sidebar-group-btn" @click="toggleGroup('notification')">
                        Thông báo
                        <span class="caret" :class="{ open: openGroups.notification }">▶</span>
                    </button>
                    <ul v-show="openGroups.notification" class="sidebar-sub">
                        <li v-if="hasPermission('notifications.manage')"><a href="/admin/notifications"
                                :class="{ active: isActive('/admin/notifications') }">Danh sách</a></li>
                        <li v-if="hasPermission('notification_settings.manage')"><a href="/admin/notification_settings"
                                :class="{ active: isActive('/admin/notification_settings') }">Cài đặt</a></li>
                    </ul>
                </li>

                <!-- Quyền -->
                <li>
                    <button class="sidebar-group-btn" @click="toggleGroup('permission')">
                        Quyền
                        <span class="caret" :class="{ open: openGroups.permission }">▶</span>
                    </button>
                    <ul v-show="openGroups.permission" class="sidebar-sub">
                        <li v-if="hasPermission('permissions.manage')"><a href="/admin/permissions"
                                :class="{ active: isActive('/admin/permissions') }">Quyền hạn</a></li>
                        <li v-if="hasPermission('roles.manage')"><a href="/admin/roles"
                                :class="{ active: isActive('/admin/roles') }">Vai trò</a></li>
                    </ul>
                </li>

                <li v-if="hasPermission('faqs.manage')"><a href="/admin/faqs"
                        :class="{ active: isActive('/admin/faqs') }">Quản lý faqs</a></li>
                <li class="logout"><a href="" @click.prevent="onLogout" :class="{ active: isActive('/logout') }">Đăng xuất</a></li>
            </ul>

        </div>
        <div v-if="sidebarOpen && isMobile" class="sidebar-backdrop" @click="sidebarOpen = false"></div>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePermissionGuard } from '~/composables/usePermissionGuard'
import { useCookie } from '#imports'
import { useRoute } from 'vue-router'
const currentUser = useCookie('currentUser', { default: () => null })
const { hasPermission } = usePermissionGuard(currentUser)
const route = useRoute()
function isActive(path) {
    if (path === '/admin') {
        return route.path === '/admin';
    }
    return route.path === path || route.path.startsWith(path + '/');
}

const sidebarOpen = ref(false)
const isMobile = ref(false)
const openGroups = ref({
    school: false,
    news: false,
    page: false,
    notification: false,
    permission: false
})
function toggleGroup(group) {
    if (openGroups.value[group]) {
        // Nếu đang mở thì đóng lại
        openGroups.value[group] = false
    } else {
        // Đóng tất cả group khác, mở group này
        Object.keys(openGroups.value).forEach(key => {
            openGroups.value[key] = false
        })
        openGroups.value[group] = true
    }
}

const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
    if (!isMobile.value) sidebarOpen.value = true
    else sidebarOpen.value = false
}
onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})
onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})

const onLogout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    currentUser.value = null
    window.location.href = '/login'
}
</script>

<style scoped>
.admin-sidebar {
    width: 220px;
    background: #222e3a;
    color: #fff;
    overflow-y: auto;
    transition: transform 0.3s cubic-bezier(.4, 0, .2, 1);
    z-index: 1002;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.07);
}

.sidebar-title {
    font-size: 1.5em;
    font-weight: 600;
    line-height: 30px;
    padding: 10px 20px;
    height: 50px;
    display: none;
}

.sidebar-content ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.sidebar-content li {
    border-bottom: 1px solid #2d3a4a;
}

.sidebar-content li.logout {
    border-bottom: none;
    background-color: #d32f2f;
}

.sidebar-content a {
    display: block;
    color: #fff;
    text-decoration: none;
    padding: 14px 20px;
    transition: background 0.2s, color 0.2s;
}

.sidebar-content a:hover,
.sidebar-content a.active {
    background: #1a2230;
    color: #ffd600;
    font-weight: 600;
}

.sidebar-content > ul > li > ul > li > a {
    padding-left: 40px !important;
}

.sidebar-hamburger {
    display: none;
    position: fixed;
    top: 6px;
    left: 10px;
    z-index: 1100;
    background: none;
    border: none;
    cursor: pointer;
    width: 40px;
    height: 40px;
}

.hamburger-icon {
    display: block;
    width: 28px;
    height: 3px;
    background: #ffffff;
    position: relative;
}

.hamburger-icon::before,
.hamburger-icon::after {
    content: '';
    display: block;
    width: 28px;
    height: 3px;
    background: #ffffff;
    position: absolute;
    left: 0;
    transition: 0.2s;
}

.hamburger-icon::before {
    top: -9px;
}

.hamburger-icon::after {
    top: 9px;
}

.sidebar-close {
    display: none;
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: #fff;
    font-size: 2em;
    cursor: pointer;
    z-index: 1101;
}

.sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.25);
    z-index: 1001;
}

/* Đồng bộ group-btn với li */
.sidebar-group-btn {
    width: 100%;
    background: none;
    border: none;
    color: #fff;
    text-align: left;
    padding: 14px 20px;
    font-size: 1em;
    cursor: pointer;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background 0.2s;
    border-radius: 0;
    border-bottom: 1px solid #2d3a4a;
    position: relative;
}

.sidebar-group-btn:hover,
.sidebar-group-btn:focus {
    background: #1a2230;
}

.caret {
    display: inline-block;
    margin-left: 8px;
    font-size: 1.1em;
    transition: transform 0.25s cubic-bezier(.4, 0, .2, 1);
    transform: rotate(0deg);
}

.caret.open {
    transform: rotate(90deg);
}

@media (max-width: 768px) {
    .sidebar-content {
        position: fixed;
        top: 0;
        left: 0;
        width: 220px;
        height: 100vh;
        background: #222e3a;
        color: #fff;
        z-index: 1002;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(.4, 0, .2, 1);
        border-radius: 0 8px 8px 0;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.07);
    }

    .sidebar-content.open {
        transform: translateX(0);
    }

    .sidebar-title {
        display: block;
    }

    .sidebar-hamburger {
        display: block;
    }

    .sidebar-close {
        display: block;
    }

    .sidebar-backdrop {
        display: block;
    }
}
</style>