<template>
    <div class="users-page">
        <h1>Quản lý người dùng</h1>
        <div class="actions">
            <button @click="showAdd = true">Thêm người dùng</button>
            <input v-model="search" placeholder="Tìm kiếm username, tên, email, phone" class="search-input"
                @keyup.enter="fetchUsers" @input="onSearchInput" />
            <select v-model="filterRole" @change="fetchUsers">
                <option value="all">Tất cả vai trò</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.code }}</option>
            </select>
            <select v-model="filterActive" @change="fetchUsers">
                <option value="all">Tất cả trạng thái</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
            </select>
            <select v-model="pageSize" @change="changePageSize">
                <option value="5">5/trang</option>
                <option value="20">20/trang</option>
                <option value="50">50/trang</option>
                <option value="all">Tất cả</option>
            </select>
            <button @click="resetFilters">Xóa bộ lọc</button>
        </div>
        <div class="record-info" style="margin-bottom: 8px;">
            <template v-if="users.length && total">
                <span>
                    Hiển thị
                    <template v-if="pageSize === 'all'">
                        1~{{ users.length }} / {{ total }} bản ghi
                    </template>
                    <template v-else>
                        {{ (page - 1) * Number(pageSize) + 1 }}~{{ Math.min(page * Number(pageSize), total) }} / {{ total }} bản ghi
                    </template>
                </span>
            </template>
        </div>
        <table class="user-table">
            <thead>
                <tr>
                    <th>
                        ID
                        <button class="sort-btn" @click="toggleSort('id')">
                            <span v-if="sortBy === 'id' && sortDir === 'asc'">▲</span>
                            <span v-else-if="sortBy === 'id' && sortDir === 'desc'">▼</span>
                            <span v-else>⇅</span>
                        </button>
                    </th>
                    <th>
                        Username
                        <button class="sort-btn" @click="toggleSort('username')">
                            <span v-if="sortBy === 'username' && sortDir === 'asc'">▲</span>
                            <span v-else-if="sortBy === 'username' && sortDir === 'desc'">▼</span>
                            <span v-else>⇅</span>
                        </button>
                    </th>
                    <th>
                        Email
                        <button class="sort-btn" @click="toggleSort('email')">
                            <span v-if="sortBy === 'email' && sortDir === 'asc'">▲</span>
                            <span v-else-if="sortBy === 'email' && sortDir === 'desc'">▼</span>
                            <span v-else>⇅</span>
                        </button>
                    </th>
                    <th>
                        Họ tên
                        <button class="sort-btn" @click="toggleSort('name')">
                            <span v-if="sortBy === 'name' && sortDir === 'asc'">▲</span>
                            <span v-else-if="sortBy === 'name' && sortDir === 'desc'">▼</span>
                            <span v-else>⇅</span>
                        </button>
                    </th>
                    <th>
                        Điện thoại
                        <button class="sort-btn" @click="toggleSort('phone')">
                            <span v-if="sortBy === 'phone' && sortDir === 'asc'">▲</span>
                            <span v-else-if="sortBy === 'phone' && sortDir === 'desc'">▼</span>
                            <span v-else>⇅</span>
                        </button>
                    </th>
                    <th>
                        Active
                        <button class="sort-btn" @click="toggleSort('is_active')">
                            <span v-if="sortBy === 'is_active' && sortDir === 'asc'">▲</span>
                            <span v-else-if="sortBy === 'is_active' && sortDir === 'desc'">▼</span>
                            <span v-else>⇅</span>
                        </button>
                    </th>
                    <th>
                        Role
                        <button class="sort-btn" @click="toggleSort('role_code')">
                            <span v-if="sortBy === 'role_code' && sortDir === 'asc'">▲</span>
                            <span v-else-if="sortBy === 'role_code' && sortDir === 'desc'">▼</span>
                            <span v-else>⇅</span>
                        </button>
                    </th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users" :key="user.id">
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.name }}</td>
                    <td>{{ user.phone }}</td>
                    <td>{{ user.is_active ? '✔' : '✖' }}</td>
                    <td>
                        <template v-if="user.Roles && user.Roles.length">
                            <span v-for="role in user.Roles" :key="role.id" class="role-badge">{{ role.code }}</span>
                        </template>
                        <!-- <select v-model="user.role_id" @change="updateUserRole(user)">
                            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.code }}</option>
                        </select> -->
                    </td>
                    <td>
                        <button @click="editUser(user)">Sửa</button>
                        <button v-if="hasPermission('user:delete')" @click="deleteUser(user.id)">Xóa</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- Thêm/sửa user -->
        <div v-if="showAdd || editingUser" class="modal">
            <div class="modal-content">
                <h3>{{ editingUser ? 'Sửa người dùng' : 'Thêm người dùng' }}</h3>
                <form @submit.prevent="saveUser">
                    <input v-model="form.username" placeholder="Username" required />
                    <input v-model="form.name" placeholder="Họ tên" />
                    <input v-model="form.email" placeholder="Email" />
                    <input v-model="form.phone" placeholder="Điện thoại" />
                    <label><input type="checkbox" v-model="form.is_active" /> Active</label>
                    <select v-model="form.role_id">
                        <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.code }}</option>
                    </select>
                    <div class="modal-actions">
                        <button type="submit">Lưu</button>
                        <button type="button" @click="closeModal">Hủy</button>
                    </div>
                </form>
            </div>
        </div>
        <!-- --- PHÂN TRANG UI --- -->
        <div v-if="pageSize !== 'all' && Number(pageSize) > 0 && total > Number(pageSize)" class="pagination">
            <button @click="goToPage(1)" :disabled="page === 1">«</button>
            <button @click="goToPage(page - 1)" :disabled="page === 1">&lt;</button>
            <span>Trang {{ page }} / {{ Math.ceil(total / Number(pageSize)) }}</span>
            <button @click="goToPage(page + 1)" :disabled="page >= Math.ceil(total / Number(pageSize))">&gt;</button>
            <button @click="goToPage(Math.ceil(total / Number(pageSize)))" :disabled="page >= Math.ceil(total / Number(pageSize))">»</button>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { usePermissionGuard } from '~/composables/usePermissionGuard'
import { useState } from '#app'

const users = ref([])
const roles = ref([])
const showAdd = ref(false)
const editingUser = ref(null)
const form = ref({ username: '', name: '', email: '', phone: '', password: '', is_active: true, role_id: '' })
const search = ref('')
const filterRole = ref('all')
const filterActive = ref('all')
const sortBy = ref('id')
const sortDir = ref('asc')
const pageSize = ref('5')
const page = ref(1)
const total = ref(0)
const currentUser = useState('currentUser')
const { hasPermission } = usePermissionGuard(currentUser)

async function fetchUsers() {
    const params = {
        search: search.value,
        role: filterRole.value,
        active: filterActive.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
        page: page.value,
        page_size: pageSize.value
    }
    if (!params.search) delete params.search
    if (params.role === 'all') delete params.role
    if (params.active === 'all') delete params.active
    if (params.sort_by === 'id' && params.sort_dir === 'asc') {
        delete params.sort_by
        delete params.sort_dir
    }
    if (params.page === 1) delete params.page
    const query = new URLSearchParams(params).toString()
    const res = await $fetch(`/api/users${query ? '?' + query : ''}`, { credentials: 'include' })
    users.value = res.users
    total.value = res.total
}
async function fetchRoles() {
    const res = await $fetch('/api/roles', { credentials: 'include' })
    roles.value = res.roles
}
function toggleSort(col) {
    if (sortBy.value === col) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortBy.value = col
        sortDir.value = 'asc'
    }
    fetchUsers()
}
function resetFilters() {
    search.value = ''
    filterRole.value = 'all'
    filterActive.value = 'all'
    sortBy.value = 'id'
    sortDir.value = 'asc'
    // Không reset page, pageSize khi xóa bộ lọc
    fetchUsers()
}
function editUser(user) {
    editingUser.value = user
    // Lấy role_id đầu tiên nếu có (giả sử 1 user chỉ có 1 role khi sửa)
    const role_id = user.Roles && user.Roles.length ? user.Roles[0].id : ''
    form.value = { ...user, password: '', role_id }
}
function closeModal() {
    showAdd.value = false
    editingUser.value = null
    form.value = { username: '', name: '', email: '', phone: '', password: '', is_active: true, role_id: '' }
}
async function saveUser() {
    if (editingUser.value) {
        await $fetch(`/api/users/${editingUser.value.id}`, { method: 'PUT', body: form.value, credentials: 'include' })
    } else {
        await $fetch('/api/users', { method: 'POST', body: form.value, credentials: 'include' })
    }
    closeModal()
    fetchUsers()
}
async function deleteUser(id) {
    if (confirm('Xóa user này?')) {
        await $fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' })
        fetchUsers()
    }
}
async function updateUserRole(user) {
    await $fetch('/api/users/assign-role', { method: 'POST', body: { userId: user.id, roleId: user.role_id }, credentials: 'include' })
    fetchUsers()
}
function changePageSize() {
    page.value = 1
    fetchUsers()
}
function goToPage(p) {
    // Chỉ cho phép chuyển trang hợp lệ
    if (pageSize.value === 'all') return;
    const maxPage = Math.ceil(total.value / Number(pageSize.value));
    if (p < 1 || p > maxPage) return;
    page.value = p;
    fetchUsers();
}
let searchTimeout = null;
function onSearchInput() {
    page.value = 1;
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchUsers();
    }, 400); // debounce 400ms
}
onMounted(() => {
    fetchRoles()
    fetchUsers()
})
definePageMeta({
    layout: "admin",
    middleware: 'auth',
    ssr: false,
})
</script>
<style scoped>
.user-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1em;
}

.user-table th,
.user-table td {
    border: 1px solid #eee;
    padding: 0.5em 0.75em;
}

.user-table th {
    background: #f5f5f5;
}

.actions {
    margin-bottom: 1em;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: #fff;
    padding: 2em;
    border-radius: 8px;
    min-width: 320px;
}

.modal-actions {
    margin-top: 1em;
    display: flex;
    gap: 1em;
    justify-content: flex-end;
}
</style>
<style scoped>
.search-input {
    margin-left: 1em;
    padding: 0.3em 0.7em;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.sort-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1em;
    margin-left: 0.2em;
    color: #888;
    padding: 0;
}
</style>