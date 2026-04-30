<template>
    <div class="users-page">
        <BaseToast ref="toastRef" />
        <div class="container">
            <h1 class="page-title">Quản lý người dùng</h1>
            <div class="page-actions">
                <button class="btn btn-success">Xuất file excel</button>
                <button class="btn btn-primary" @click="showAdd = true">Thêm người dùng</button>

            </div>
            <div class="page-filters">
                <BaseSearchFilter v-model="search" @update:search="onSearchInput" />
                <label for="filterRole" hidden></label>
                <select id="filterRole" class="filter-role" v-model="filterRole" @change="onFilterChange">
                    <option value="all">Tất cả vai trò</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.code }}</option>
                </select>
                <label for="filterActive" hidden></label>
                <select id="filterActive" class="filter-active" v-model="filterActive" @change="onFilterChange">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
                <label for="pageSize" hidden></label>
                <select id="pageSize" class="filter-page-size" v-model="pageSize" @change="changePageSize">
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
                    <tr v-if="!users.length">
                        <td :colspan="8" class="center">Không có bản ghi</td>
                    </tr>
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
                                <span v-for="role in user.Roles" :key="role.id" :class="['role-badge', role.code]">{{
                                    role.code
                                }}</span>
                            </template>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view" @click="viewUser(user)" title="Xem chi tiết"><i
                                        class="fas fa-eye"></i></button>
                                <button class="action-btn edit" @click="editUser(user)" title="Sửa"><i
                                        class="fas fa-edit"></i></button>
                                <button class="action-btn reset" @click="openResetPasswordModal(user)"
                                    title="Đặt lại mật khẩu"><i class="fas fa-key"></i></button>
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
                                <span v-for="role in detailUser.Roles" :key="role.id"
                                    :class="['role-badge', role.code]">{{ role.code
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
                    <form class="create-form" @submit.prevent="saveUser">
                        <div class="form-group">
                            <label for="username">Username: <span class="required">*</span></label>
                            <input id="username" v-model="form.username" placeholder="Username" required
                                :class="{ 'input-error': errors.username }" />
                            <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
                        </div>
                        <div class="form-group">
                            <label for="name">Họ tên: <span class="required">*</span></label>
                            <input id="name" v-model="form.name" placeholder="Họ tên" required
                                :class="{ 'input-error': errors.name }" />
                            <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
                        </div>
                        <div class="form-group">
                            <label for="email">Email: <span class="required">*</span></label>
                            <input id="email" v-model="form.email" placeholder="Email" required
                                :class="{ 'input-error': errors.email }" />
                            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
                        </div>
                        <div class="form-group">
                            <label for="phone">Điện thoại:</label>
                            <input id="phone" v-model="form.phone" placeholder="Điện thoại"
                                :class="{ 'input-error': errors.phone }" />
                            <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>
                        </div>
                        <div class="form-row">

                            <div class="form-group">
                                <label for="is_active">Trạng thái:</label>
                                <label><input id="is_active" type="checkbox" v-model="form.is_active" /> Active</label>
                            </div>

                            <div class="form-group">
                                <label for="role_ids">Vai trò: <span class="required">*</span></label>
                                <select id="role_ids" v-model="form.role_ids" multiple style="min-height: 90px"
                                    :class="{ 'input-error': errors.role_ids }">
                                    <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.code }}
                                    </option>
                                </select>
                                <span v-if="errors.role_ids" class="error-msg">Bạn phải chọn ít nhất 1 vai trò</span>
                            </div>
                        </div>
                        <div class="form-row" v-if="!editingUser">
                            <div class="form-group">
                                <label for="password">Mật khẩu: <span class="required">*</span></label>
                                <input id="password" v-model="form.password" placeholder="Mật khẩu" type="password"
                                    :class="{ 'input-error': errors.password }" />
                                <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
                            </div>
                            <div class="form-group" v-if="!editingUser">
                                <label for="passwordRepeat">Nhập lại mật khẩu: <span class="required">*</span></label>
                                <input id="passwordRepeat" v-model="form.passwordRepeat" placeholder="Nhập lại mật khẩu"
                                    type="password" :class="{ 'input-error': errors.passwordRepeat }" />
                                <span v-if="errors.passwordRepeat" class="error-msg">{{ errors.passwordRepeat }}</span>
                            </div>
                            <div class="form-rules">
                                <p class="rules-title">Mật khẩu phải:</p>
                                <ul class="rules-list">
                                    <li :class="{ pass: passwordRules.length }">
                                        <i
                                            :class="passwordRules.length ? 'fas fa-check-circle pass' : 'fas fa-times-circle fail'"></i>
                                        Ít nhất 8 ký tự
                                    </li>
                                    <li :class="{ pass: passwordRules.upper }">
                                        <i
                                            :class="passwordRules.upper ? 'fas fa-check-circle pass' : 'fas fa-times-circle fail'"></i>
                                        Chứa chữ hoa
                                    </li>
                                    <li :class="{ pass: passwordRules.lower }">
                                        <i
                                            :class="passwordRules.lower ? 'fas fa-check-circle pass' : 'fas fa-times-circle fail'"></i>
                                        Chứa chữ thường
                                    </li>
                                    <li :class="{ pass: passwordRules.digit }">
                                        <i
                                            :class="passwordRules.digit ? 'fas fa-check-circle pass' : 'fas fa-times-circle fail'"></i>
                                        Chứa số
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary" type="submit">Lưu</button>
                            <button class="btn btn-secondary" type="button" @click="closeModal">Hủy</button>
                        </div>
                    </form>
                </div>
            </div>
            <!-- Modal reset mật khẩu -->
            <div v-if="showResetPassword && resetUser" class="modal">
                <div class="modal-content">

                    <div v-if="resetResult" class="reset-result">
                        <i class="fas fa-check-circle success-icon"></i>
                        <p class="success-text">Reset mật khẩu thành công!</p>
                    </div>
                    <div v-else class="reset-confirmation">
                        <i class="fas fa-key warning-icon"></i>
                        <p>Bạn có chắc chắn muốn reset mật khẩu cho người dùng <strong>{{ resetUser.name }}</strong>?
                        </p>
                    </div>
                    <div class="detail-content">
                        <div class="form-row">
                            <div class="form-group">
                                <p class="detail-title">Tên đăng nhập:</p>
                                <p class="detail-info">{{ resetUser.username }}</p>
                            </div>
                            <div class="form-group">
                                <p class="detail-title">Họ tên:</p>
                                <p class="detail-info">{{ resetUser.name }}</p>
                            </div>
                        </div>
                        <div class="form-group">
                            <p class="detail-title">Roles:</p>
                            <template v-if="resetUser.Roles && resetUser.Roles.length">
                                <span v-for="role in resetUser.Roles" :key="role.id"
                                    :class="['role-badge', role.code]">{{ role.code
                                    }}</span>
                            </template>
                        </div>
                        <div v-if="resetResult">
                            <div class="form-group">
                                <p class="detail-title">Mật khẩu mới:</p>
                                <div class="form-row">
                                    <p class="detail-info new-password">{{ resetResult }}</p>
                                    <!-- <span class="new-password">{{ resetResult }}</span> -->
                                    <button class="btn copy" @click="copyPassword" title="Copy"><i
                                            class="fas fa-copy"></i></button>
                                </div>
                            </div>
                            <div class="important-note">
                                <i class="fas fa-exclamation-triangle"></i>
                                <p><strong>Quan trọng:</strong> Hãy copy và gửi thông tin này cho người dùng ngay. Sau
                                    khi đóng
                                    modal này, bạn sẽ không thể xem lại mật khẩu!</p>
                            </div>
                        </div>
                        <div v-else class="modal-actions">
                            <button class="btn btn-primary" @click="resetPassword" :disabled="resetLoading">Đặt lại mật
                                khẩu</button>
                            <button class="btn btn-secondary" @click="closeResetPasswordModal">Hủy</button>
                        </div>
                        <div v-if="resetResult" class="modal-actions">
                            <button class="btn btn-secondary" @click="closeResetPasswordModal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- --- PHÂN TRANG UI --- -->
            <BasePagination v-if="pageSize !== 'all' && Number(pageSize) > 0 && total > Number(pageSize)" v-model="page"
                :total-pages="Math.ceil(total / Number(pageSize))" />
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import BaseToast from '~/components/admin/base/BaseToast.vue'
import { validateUser, validateUsername, validateName, validateEmail, validatePhone, validatePassword } from '~/utils/fieldValidation.js'
import { usePermissionGuard } from '~/composables/usePermissionGuard'
import { useCookie } from '#imports'
import BaseTable from '~/components/admin/base/BaseTable.vue'
import BasePagination from '~/components/admin/base/BasePagination.vue'
import BaseSearchFilter from '~/components/admin/base/BaseSearchFilter.vue'

const users = ref([])
const toastRef = ref()
const roles = ref([])
const showAdd = ref(false)
const showDetail = ref(false)
const detailUser = ref(null)
const editingUser = ref(null)
const form = ref({ username: '', name: '', email: '', phone: '', password: '', passwordRepeat: '', is_active: true, role_ids: [] })
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

const showResetPassword = ref(false)
const resetUser = ref(null)
const resetResult = ref("")
const resetLoading = ref(false)

const errors = ref({})

// Realtime password rules check
const passwordRules = computed(() => {
    const pw = form.value.password || ''
    return {
        length: pw.length >= 8,
        lower: /[a-z]/.test(pw),
        upper: /[A-Z]/.test(pw),
        digit: /\d/.test(pw)
    }
})

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
    form.value = { ...user, password: '', passwordRepeat: '', role_ids }
    errors.value = {}
}
function closeModal() {
    showAdd.value = false
    editingUser.value = null
    form.value = { username: '', name: '', email: '', phone: '', password: '', passwordRepeat: '', is_active: true, role_ids: [] }
    errors.value = {}
}
async function saveUser() {
    const payload = { ...form.value };
    // Validate phía client
    const newErrors = validateUser(payload, !!editingUser.value);
    if (!editingUser.value && payload.password !== payload.passwordRepeat) {
        newErrors.passwordRepeat = 'PASSWORD_REPEAT_MISMATCH';
    }
    if (!payload.role_ids || !Array.isArray(payload.role_ids) || payload.role_ids.length === 0) {
        newErrors.role_ids = 'ROLE_REQUIRED';
    }
    errors.value = newErrors;
    if (Object.keys(newErrors).length > 0) {
        return;
    }
    // Xóa trường passwordRepeat trước khi gửi
    delete payload.passwordRepeat;
    // Nếu là sửa user thì không gửi trường password
    if (editingUser.value) {
        delete payload.password;
    }
    // Đảm bảo role_ids là mảng số
    if (payload.role_ids) payload.role_ids = payload.role_ids.map(Number);
    console.log('Payload gửi lên server:', payload);
    try {
        if (editingUser.value) {
            await $fetch(`/api/users/${editingUser.value.id}`, { method: 'PUT', body: payload, credentials: 'include' })
            toastRef.value?.open('Cập nhật người dùng thành công!', 'success')
        } else {
            await $fetch('/api/users', { method: 'POST', body: payload, credentials: 'include' })
            toastRef.value?.open('Thêm người dùng thành công!', 'success')
        }
        closeModal()
        fetchUsers()
    } catch (err) {
        let msg = 'Đã có lỗi xảy ra.'
        if (err?.data?.message === 'USERNAME_EXISTS') msg = 'Tên đăng nhập đã tồn tại!'
        else if (err?.data?.message === 'EMAIL_EXISTS') msg = 'Email đã tồn tại!'
        else if (err?.data?.message === 'USER_VALIDATION_FAILED') msg = 'Dữ liệu không hợp lệ!'
        else if (err?.data?.message === 'ASSIGN_ROLE_FAILED') msg = 'Gán vai trò thất bại!'
        else if (err?.data?.message === 'USER_CREATE_FAILED') msg = 'Tạo người dùng thất bại!'
        toastRef.value?.open(msg, 'error')
    }
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

function openResetPasswordModal(user) {
    resetUser.value = user
    showResetPassword.value = true
    resetResult.value = ""
}
function closeResetPasswordModal() {
    showResetPassword.value = false
    resetUser.value = null
    resetResult.value = ""
}
async function resetPassword() {
    if (!resetUser.value) return
    resetLoading.value = true
    try {
        const res = await $fetch(`/api/users/${resetUser.value.id}/reset-password`, { method: 'POST', credentials: 'include' })
        resetResult.value = res.newPassword
        toastRef.value?.open('Đặt lại mật khẩu thành công!', 'success')
        fetchUsers()
    } catch (err) {
        toastRef.value?.open('Đặt lại mật khẩu thất bại!', 'error')
    } finally {
        resetLoading.value = false
    }
}
function copyPassword() {
    if (!resetResult.value) return
    navigator.clipboard.writeText(resetResult.value)
    toastRef.value?.open('Đã copy mật khẩu mới!', 'success')
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

/* Modal reset password user */
.new-password {
    background: #fff3cd;
    border-color: #ffeaa7;
    font-weight: 600;
    color: #856404;
    min-width: 200px;
}

.btn.copy {
    padding: 0.75rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 45px;
}

.btn.copy:hover {
    background: #0056b3;
    transform: translateY(-1px);
}

.important-note {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.important-note i {
    color: #856404;
    margin-top: 0.1rem;
    flex-shrink: 0;
}

.important-note p {
    color: #856404;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
}

.reset-confirmation,
.reset-result {
    text-align: center;
    padding-bottom: 20px;
}

.reset-confirmation .warning-icon,
.reset-result .success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.reset-confirmation .warning-icon {
    color: #f57400;
}

.reset-result .success-icon {
    color: #28a745;
}

/* Inline error style */
.input-error {
    border-color: #d32f2f !important;
    background: #fff6f6;
}

.error-msg {
    color: #d32f2f;
    font-size: 13px;
    margin-top: 2px;
    margin-bottom: 2px;
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