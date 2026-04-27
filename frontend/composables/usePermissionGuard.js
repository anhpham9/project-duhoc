import { ref, toRaw, isRef } from 'vue'

// Quy ước: quyền dạng string, ví dụ: 'user:read', 'user:delete', ...
// currentUser phải có mảng permissions
export function usePermissionGuard(currentUser) {
    // Helper: always get raw array from permissions
    function getRawPermissions() {
        if (!currentUser.value || !currentUser.value.permissions) {
            console.warn('[usePermissionGuard] No currentUser or permissions:', currentUser.value)
            return []
        }
        const perms = currentUser.value.permissions
        // Handle Ref/Proxy/Array
        if (isRef(perms)) return toRaw(perms.value)
        return Array.isArray(perms) ? toRaw(perms) : []
    }

    // Kiểm tra có quyền cụ thể không
    function hasPermission(permission) {
        const permissions = getRawPermissions()
        const result = permissions.includes(permission)
        // console.log(`[usePermissionGuard] Check permission '${permission}':`, result, permissions)
        return result
    }
    // Kiểm tra có ít nhất 1 quyền trong danh sách
    function hasAnyPermission(permissionList) {
        const permissions = getRawPermissions()
        const result = permissionList.some(p => permissions.includes(p))
        console.log(`[usePermissionGuard] Check any permission in`, permissionList, ':', result, permissions)
        return result
    }
    return { hasPermission, hasAnyPermission }
}
