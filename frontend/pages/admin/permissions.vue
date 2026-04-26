<template>
    <div>
        <h1>Quản lý phân quyền (RBAC)</h1>
        <div v-if="!isSuperadmin" class="error">Bạn không có quyền truy cập trang này.</div>
        <div v-else class="rbac-container">
            <div class="roles-panel">
                <h2>Nhóm người dùng (Role)</h2>
                <input v-model="roleSearch" placeholder="Tìm kiếm nhóm..." class="search-box" />
                <ul>
                    <li v-for="role in filteredRoles" :key="role.id" :class="{ selected: role.id === selectedRoleId }"
                        @click="selectRole(role.id)">
                        <b>{{ role.code }}</b> <span>- {{ role.description }}</span>
                    </li>
                </ul>
            </div>
            <div class="permissions-panel" v-if="selectedRoleId">
                <h2>Phân quyền cho: <span class="role-label">{{ selectedRoleLabel }}</span></h2>
                <PermissionTree :tree="permissionTree" v-model="selectedPerms" />
                <button class="save-btn" @click="saveRolePermissions">Lưu phân quyền</button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import PermissionTree from '~/components/admin/PermissionTree.vue'
const isSuperadmin = ref(false)
const roles = ref([])
const permissions = ref([])
const selectedRoleId = ref(null)
const selectedPerms = ref([])
const roleSearch = ref('')

const filteredRoles = computed(() => {
    if (!roleSearch.value) return roles.value
    const lower = roleSearch.value.toLowerCase()
    return roles.value.filter(r => r.code.toLowerCase().includes(lower) || (r.description || '').toLowerCase().includes(lower))
})
const selectedRoleLabel = computed(() => {
    const r = roles.value.find(r => r.id === selectedRoleId.value)
    return r ? r.code : ''
})

const permissionTree = computed(() => {
    // Giả sử permission code dạng: group.action (vd: user.view, user.create)
    const groups = {}
    for (const perm of permissions.value) {
        const [group, action] = perm.code.split('.')
        if (!groups[group]) groups[group] = { code: group, label: group.charAt(0).toUpperCase() + group.slice(1), children: [] }
        let child = groups[group].children.find(c => c.code === group)
        if (!child) {
            child = { id: perm.id, code: perm.code, label: perm.description || perm.code, actions: [] }
            groups[group].children.push(child)
        }
        if (action) {
            child.actions = child.actions || []
            child.actions.push({ code: action, label: action.charAt(0).toUpperCase() + action.slice(1), fullCode: perm.id })
        }
    }
    return Object.values(groups)
})

async function checkSuperadmin() {
    try {
        const me = await $fetch('/api/auth/me', { credentials: 'include' })
        isSuperadmin.value = Array.isArray(me.role_ids) ? me.role_ids.includes(1) : false
    } catch {
        isSuperadmin.value = false
    }
}
async function fetchRoles() {
    const res = await $fetch('/api/roles', { credentials: 'include' })
    roles.value = res.roles
}
async function fetchPermissions() {
    const res = await $fetch('/api/permissions', { credentials: 'include' })
    permissions.value = res.permissions
}
async function fetchRolePermissions(roleId) {
    const res = await $fetch(`/api/permissions/role/${roleId}`, { credentials: 'include' })
    selectedPerms.value = res.rolePermissions.map(rp => rp.permission_id)
}
function selectRole(id) {
    selectedRoleId.value = id
    fetchRolePermissions(id)
}
async function saveRolePermissions() {
    await $fetch(`/api/permissions/role/${selectedRoleId.value}`, {
        method: 'POST',
        body: { permissionIds: selectedPerms.value },
        credentials: 'include',
    })
    alert('Lưu phân quyền thành công!')
}
onMounted(() => {
    checkSuperadmin()
    fetchRoles()
    fetchPermissions()
})
definePageMeta({
    layout: "admin",
    middleware: 'auth',
    ssr: false,
})
</script>
<style scoped>
.rbac-container {
    display: flex;
    gap: 2em;
    margin-top: 2em;
}

.roles-panel {
    min-width: 220px;
    border-right: 1px solid #eee;
    padding-right: 2em;
}

.roles-panel ul {
    list-style: none;
    padding: 0;
}

.roles-panel li {
    padding: 0.5em 0.75em;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 0.25em;
}

.roles-panel li.selected {
    background: #e3f2fd;
    font-weight: bold;
}

.permissions-panel {
    flex: 1;
}

.role-label {
    color: #1976d2;
    font-weight: bold;
}

.save-btn {
    margin-top: 1em;
    background: #1976d2;
    color: #fff;
    border: none;
    padding: 0.5em 1.5em;
    border-radius: 4px;
    cursor: pointer;
}

.search-box {
    width: 100%;
    margin-bottom: 0.5em;
    padding: 0.5em;
    border-radius: 4px;
    border: 1px solid #ccc;
}
</style>
