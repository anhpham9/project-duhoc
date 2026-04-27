<template>
    <div class="admin-sidebar">
        <ul>
            <li><a href="/admin">Dashboard</a></li>
            <li v-if="hasPermission('user.manage')"><a href="/admin/users">Users</a></li>
            <li v-if="hasPermission('contact.manage')"><a href="/admin/contacts">Liên hệ</a></li>
            <li v-if="hasPermission('activity_logs.view')"><a href="/admin/activity-logs">Activity Logs</a></li>
            <li v-if="hasPermission('permissions.manage')"><a href="/admin/permissions">Quản lý quyền</a></li>
            <li v-if="hasPermission('roles.manage')"><a href="/admin/roles">Quản lý roles</a></li>
            <li v-if="hasPermission('news.manage')"><a href="/admin/news">Quản lý tin tức</a></li>
            <li v-if="hasPermission('schools.manage')"><a href="/admin/schools">Quản lý trường</a></li>
            <li v-if="hasPermission('regions.manage')"><a href="/admin/regions">Quản lý khu vực</a></li>
            <li v-if="hasPermission('school_types.manage')"><a href="/admin/school_types">Quản lý loại trường</a></li>
            <li v-if="hasPermission('reviews.manage')"><a href="/admin/school_reviews">Quản lý review trường</a></li>
            <li v-if="hasPermission('faqs.manage')"><a href="/admin/faqs">Quản lý faqs</a></li>
            <li v-if="hasPermission('static_pages.manage')"><a href="/admin/static_pages">Quản lý Trang</a></li>
            <li v-if="hasPermission('page_contents.manage')"><a href="/admin/page_contents">Quản lý nội dung trang</a></li>
            <li v-if="hasPermission('notifications.manage')"><a href="/admin/notifications">Quản lý thông báo</a></li>
            <li><a href="" @click.prevent="onLogout">Đăng xuất</a></li>
        </ul>
    </div>
</template>
<script setup>


import { usePermissionGuard } from '~/composables/usePermissionGuard'
import { useCookie } from '#imports'
const currentUser = useCookie('currentUser', { default: () => null })
const { hasPermission } = usePermissionGuard(currentUser) // truyền ref, không phải .value

// console.log('[AdminSidebar] currentUser:', currentUser.value)
// if (currentUser.value && currentUser.value.permissions) {
//     console.log('[AdminSidebar] permissions:', currentUser.value.permissions)
// } else {
//     console.log('[AdminSidebar] No permissions found for currentUser')
// }

const onLogout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    currentUser.value = null
    window.location.href = '/login'
}
</script>