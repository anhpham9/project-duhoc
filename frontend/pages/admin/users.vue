<template>
    <div class="users-page">
        <h1>Quản lý người dùng</h1>
        <div class="actions">
            <button @click="showAdd = true">Thêm người dùng</button>
        </div>
        <table class="user-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Họ tên</th>
                    <th>Điện thoại</th>
                    <th>Active</th>
                    <th>Role</th>
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
                        <button @click="deleteUser(user.id)">Xóa</button>
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
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const users = ref([])
const roles = ref([])
const showAdd = ref(false)
const editingUser = ref(null)
const form = ref({ username: '', name: '', email: '', phone: '', password: '', is_active: true, role_id: '' })

async function fetchUsers() {
    const res = await $fetch('/api/users', { credentials: 'include' })
    users.value = res.users
    console.log('users.value', users.value)
}
async function fetchRoles() {
    const res = await $fetch('/api/roles', { credentials: 'include' })
    roles.value = res.roles
    console.log('roles.value:', roles.value)
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
onMounted(() => {
    fetchUsers()
    fetchRoles()
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