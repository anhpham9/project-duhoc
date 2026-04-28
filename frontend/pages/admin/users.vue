<template>
    <div class="users-page">
        <div class="container">
            <h1 class="page-title">Quản lý người dùng</h1>
            <div class="page-actions">
                <button class="btn btn-success">Xuất file excel</button>
                <button class="btn btn-primary" @click="showAdd = true">Thêm người dùng</button>

            </div>
            <div class="page-filters">
                <BaseSearchFilter v-model="search" @update:search="onSearchInput" />
                <select class="filter-role" v-model="filterRole" @change="onFilterChange">
                    <option value="all">Tất cả vai trò</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.code }}</option>
                </select>
                <select class="filter-active" v-model="filterActive" @change="onFilterChange">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
                <select class="filter-page-size" v-model="pageSize" @change="changePageSize">
                    <option value="5">5 bản ghi/trang</option>
                    <option value="20">20 bản ghi/trang</option>
                    <option value="50">50 bản ghi/trang</option>
                    <option value="all">Tất cả</option>
                </select>
                <button class="btn btn-outline" @click="resetFilters"><i class="fas fa-eraser"></i> Xóa bộ lọc</button>
            </div>

            <div class="record-info" style="margin-bottom: 8px;">
                <template v-if="users.length && total">
                    <span>
                        Hiển thị
                        <template v-if="pageSize === 'all'">
                            1~{{ users.length }} / {{ total }} bản ghi
                        </template>
                        <template v-else>
                            {{ (page - 1) * Number(pageSize) + 1 }}~{{ Math.min(page * Number(pageSize), total) }} / {{
                                total }} bản ghi
                        </template>
                    </span>
                </template>
            </div>
            <BaseTable>
                <template #table-header>
                    <th class="center">
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
                    <th class="center">
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
                </template>
                <template #table-body>
                    <tr v-for="user in users" :key="user.id">
                        <td class="center">{{ user.id }}</td>
                        <td>{{ user.username }}</td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.name }}</td>
                        <td>{{ user.phone }}</td>
                        <td class="center">
                            <span :class="['status', user.is_active ? 'active' : 'inactive']">
                                {{ user.is_active ? '✔' : '✖' }}
                            </span>
                        </td>
                        <td>
                            <template v-if="user.Roles && user.Roles.length">
                                <span v-for="role in user.Roles" :key="role.id" :class="['role-badge', role.code]">{{ role.code
                                    }}</span>
                            </template>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view" @click="viewUser(user)" title="Xem chi tiết"><i
                                        class="fas fa-eye"></i></button>
                                <button class="action-btn edit" @click="editUser(user)" title="Sửa"><i
                                        class="fas fa-edit"></i></button>
                                <button class="action-btn delete" v-if="hasPermission('user.delete')"
                                    @click="deleteUser(user.id)" title="Xóa"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                </template>
            </BaseTable>

            <!-- Modal xem chi tiết user -->
            <div v-if="showDetail && detailUser" class="modal">
                <div class="modal-content">
                    <h3>Chi tiết người dùng</h3>
                    <div class="detail-content">
                        <div class="form-row">
                            <div class="form-group">
                                <p class="detail-title">ID:</p>
                                <p class="detail-info">{{ detailUser.id }}</p>
                            </div>
                            <div class="form-group">
                                <p class="detail-title">Username:</p>
                                <p class="detail-info">{{ detailUser.username }}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <p class="detail-title">Họ tên:</p>
                            <p class="detail-info">{{ detailUser.name }}</p>
                        </div>
                        <div class="form-group">
                            <p class="detail-title">Email:</p>
                            <p class="detail-info">{{ detailUser.email }}</p>
                        </div>
                        <div class="form-group">
                            <p class="detail-title">Điện thoại:</p>
                            <p class="detail-info">{{ detailUser.phone || 'N/A' }}</p>
                        </div>
                        <div class="form-group">
                            <p class="detail-title">Active:</p>
                            <span :class="['status', detailUser.is_active ? 'active' : 'inactive']">{{
                                detailUser.is_active ?
                                    '✔' : '✖'
                            }}</span>
                        </div>
                        <div class="form-group">
                            <p class="detail-title">Roles:</p>
                            <template v-if="detailUser.Roles && detailUser.Roles.length">
                                <span v-for="role in detailUser.Roles" :key="role.id" :class="['role-badge', role.code]">{{ role.code
                                    }}</span>
                            </template>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" type="button" @click="closeDetail">Đóng</button>
                    </div>
                </div>
            </div>

            <!-- Thêm/sửa user -->
            <div v-if="showAdd || editingUser" class="modal">
                <div class="modal-content">
                    <h3>{{ editingUser ? 'Sửa người dùng' : 'Thêm người dùng' }}</h3>
                    <form @submit.prevent="saveUser">
                        <div class="form-group">
                            <label for="username">Username:</label>
                            <input v-model="form.username" placeholder="Username" required />
                        </div>
                        <div class="form-group">
                            <label for="name">Họ tên:</label>
                            <input v-model="form.name" placeholder="Họ tên" />
                        </div>
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input v-model="form.email" placeholder="Email" />
                        </div>
                        <div class="form-group">
                            <label for="phone">Điện thoại:</label>
                            <input v-model="form.phone" placeholder="Điện thoại" />
                        </div>
                        <div class="form-row">

                            <div class="form-group">
                                <label for="is_active">Trạng thái:</label>
                                <label><input type="checkbox" v-model="form.is_active" /> Active</label>
                            </div>

                            <div class="form-group">
                                <label for="role_ids">Vai trò:</label>
                                <select v-model="form.role_ids" multiple style="min-height: 90px">
                                    <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.code }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary" type="submit">Lưu</button>
                            <button class="btn btn-secondary" type="button" @click="closeModal">Hủy</button>
                        </div>
                    </form>
                </div>
            </div>
            <!-- --- PHÂN TRANG UI --- -->
            <BasePagination v-if="pageSize !== 'all' && Number(pageSize) > 0 && total > Number(pageSize)" v-model="page"
                :total-pages="Math.ceil(total / Number(pageSize))" />
        </div>
    </div>
</template>
<script setup>

import { ref, onMounted, watch } from 'vue'
import { usePermissionGuard } from '~/composables/usePermissionGuard'
import { useCookie } from '#imports'
import BaseTable from '~/components/admin/base/BaseTable.vue'
import BasePagination from '~/components/admin/base/BasePagination.vue'
import BaseSearchFilter from '~/components/admin/base/BaseSearchFilter.vue'

const users = ref([])
const roles = ref([])
const showAdd = ref(false)
const showDetail = ref(false)
const detailUser = ref(null)
const editingUser = ref(null)
const form = ref({ username: '', name: '', email: '', phone: '', password: '', is_active: true, role_ids: [] })
const search = ref('')
const filterRole = ref('all')
const filterActive = ref('all')
const sortBy = ref('id')
const sortDir = ref('asc')
const pageSize = ref('5')
const page = ref(1)
const total = ref(0)
const currentUser = useCookie('currentUser')
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
    const res = await $fetch(`/api/users${query ? '?' + query : ''}`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
    })
    users.value = res.users
    total.value = res.total
}
async function fetchRoles() {
    const res = await $fetch('/api/roles', { credentials: 'include' })
    roles.value = res.roles
    // console.log('[fetchRoles] Fetched roles:', roles.value);
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
    // Lấy tất cả role_ids nếu có
    const role_ids = user.Roles && user.Roles.length ? user.Roles.map(r => r.id) : []
    form.value = { ...user, password: '', role_ids }
}
function closeModal() {
    showAdd.value = false
    editingUser.value = null
    form.value = { username: '', name: '', email: '', phone: '', password: '', is_active: true, role_ids: [] }
}
async function saveUser() {
    const payload = { ...form.value };
    // Đảm bảo role_ids là mảng số
    if (payload.role_ids) payload.role_ids = payload.role_ids.map(Number);
    if (editingUser.value) {
        await $fetch(`/api/users/${editingUser.value.id}`, { method: 'PUT', body: payload, credentials: 'include' })
    } else {
        await $fetch('/api/users', { method: 'POST', body: payload, credentials: 'include' })
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
    // Not used in new multi-role version, but if needed:
    await $fetch('/api/users/assign-role', { method: 'POST', body: { userId: user.id, roleIds: user.role_ids }, credentials: 'include' })
    fetchUsers()
}

function viewUser(user) {
    detailUser.value = user
    showDetail.value = true
}
function closeDetail() {
    showDetail.value = false
    detailUser.value = null
}
function changePageSize() {
    page.value = 1
    fetchUsers()
}
let searchTimeout = null;
function onSearchInput() {
    page.value = 1;
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchUsers();
    }, 400); // debounce 400ms
}
function onFilterChange() {
    page.value = 1;
    fetchUsers();
}
onMounted(() => {
    fetchRoles()
    fetchUsers()
})
// Khi chuyển trang, fetch lại dữ liệu
watch(page, () => {
    fetchUsers()
})
definePageMeta({
    layout: "admin",
    middleware: 'auth',
    ssr: false,
})
</script>

<style scoped>
.users-page {}

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

.page-actions {
    display: flex;
    justify-content: end;
    gap: 20px;
    align-items: center;
    margin-top: 1em;
    margin-bottom: 1em;
}

.page-filters {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 1em;
}

.filter-role,
.filter-active,
.filter-page-size {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.filter-role:hover,
.filter-active:hover,
.filter-page-size:hover,
.filter-role:focus,
.filter-active:focus,
.filter-page-size:focus {
    border-color: #888;
    outline: none;
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
    z-index: 1000;
}

.modal-content {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    min-width: 600px;
}

.modal-content h3 {
    text-align: center;
    margin-bottom: 20px;
}

/* Container form (nếu nằm trong modal/card) */
form,
.detail-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Group */
.form-group {
    display: flex;
    flex-direction: column;
}

/* Label */
.form-group>label:first-child,
.detail-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #333;
}

/* Input + Select */
.form-group input,
.form-group select,
.detail-info {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    outline: none;
    font-size: 14px;
    line-height: 20px;
    transition: all 0.2s ease;
}

/* Focus */
.form-group input:focus,
.form-group select:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

/* Checkbox group */
.form-group label input[type="checkbox"] {
    margin-right: 6px;
}

/* Row (2 cột) */
.form-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.form-row .form-group {
    flex: 1 1 200px;
}

.role-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.85em;
    margin-right: 4px;
    width: fit-content;
}

.role-badge.superadmin {
    background: #fee2e2;
    color: #d32f2f;
}

.role-badge.admin {
    background: #e0e7ff;
    color: #1976d2;
}

.role-badge.manager {
    background: #fff3e0;
    color: #f57c00;
}

.role-badge.editor {
    background: #f4fff5;
    color: #388e3c;
}

.role-badge.consultant {
    background: #fcf7ff;
    color: #7b1fa2;
}

/* Actions */
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 50px;
    margin-top: 10px;
}

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

/* Modal chi tiết user */
.detail-row {
    margin-bottom: 8px;
    font-size: 1.05em;
}

@media (max-width: 768px) {

    .page-filters {
        flex-wrap: wrap;
    }

    .filter-role,
    .filter-active,
    .filter-page-size {
        flex: 0 0 calc(50% - 5px);
    }
}

@media (max-width: 480px) {
    .modal-content {
        min-width: 90vw;
        max-height: 80vh;
        overflow-y: auto;
    }
}
</style>