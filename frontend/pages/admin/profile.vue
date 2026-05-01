<template>
    <div class="profile-page">
        <BaseToast ref="toastRef" />
        <div class="container">
            <h1 class="page-title">Quản lý người dùng</h1>

            <div class="tabs">
                <button class="tab-btn" :class="{ active: activeTab === 0 }" @click="activeTab = 0">Thông tin cá
                    nhân</button>
                <button class="tab-btn" :class="{ active: activeTab === 1 }" @click="activeTab = 1">Đổi mật
                    khẩu</button>
                <button class="tab-btn" :class="{ active: activeTab === 2 }" @click="activeTab = 2">Lịch sử hoạt
                    động</button>
            </div>

            <div class="tab-content">
                <div class="tab-pane" v-if="activeTab === 0">
                    <!-- Nội dung tab Thông tin cá nhân sẽ để form profile ở đây -->
                    <div class="profile-card">
                        <h2>Thông tin cá nhân</h2>

                        <form class="create-form" @submit.prevent="updateProfile">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="name">Họ tên: <span class="required">*</span></label>
                                    <input id="name" v-model="form.name" placeholder="Họ tên" required
                                        :class="{ 'input-error': errors.name }" autocomplete="off" />
                                    <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
                                </div>
                                <div class="form-group">
                                    <label for="email">Email: <span class="required">*</span></label>
                                    <input id="email" v-model="form.email" placeholder="Email" required
                                        :class="{ 'input-error': errors.email }" autocomplete="off" />
                                    <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="phone">Điện thoại:</label>
                                    <input id="phone" v-model="form.phone" placeholder="Điện thoại"
                                        :class="{ 'input-error': errors.phone }" autocomplete="off" />
                                    <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>
                                </div>
                                <div class="form-group">
                                    <label for="zalo">Zalo:</label>
                                    <input id="zalo" v-model="form.zalo" placeholder="số_điện_thoại"
                                        :class="{ 'input-error': errors.zalo }" autocomplete="off" />
                                    <span v-if="errors.zalo" class="error-msg">{{ errors.zalo }}</span>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="fb">Facebook:</label>
                                    <input id="fb" v-model="form.fb" placeholder="Link Facebook"
                                        :class="{ 'input-error': errors.fb }" autocomplete="off" />
                                    <span v-if="errors.fb" class="error-msg">{{ errors.fb }}</span>
                                </div>
                                <div class="form-group">
                                    <p class="detail-title">Role:</p>
                                    <p><span v-for="role in form.Roles" :key="role.id"
                                            :class="['role-badge', role.code]">{{
                                                role.code }}</span></p>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <p class="detail-title">Ngày tạo:</p>
                                    <p class="detail-info">{{ formatDate(form.created_at) }}</p>
                                </div>
                                <div class="form-group">
                                    <p class="detail-title">Được tạo bởi:</p>
                                    <p class="detail-info">{{ form.created_by_name || 'N/A' }}</p>
                                </div>
                            </div>
                            <div class="form-row">
                                <button type="submit" class="btn btn-primary" :disabled="loadding">
                                    <span v-if="loadding" class="spinner" style="margin-right:6px;"></span>
                                    Lưu thay đổi
                                </button>
                                <button type="button" @click="cancelUpdate" class="btn btn-secondary">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="tab-pane" v-if="activeTab === 1">
                    <div class="profile-card">
                        <h2>Đổi mật khẩu</h2>
                        <form class="create-form" @submit.prevent="changePassword">
                            <div class="form-group">
                                <label for="currentPassword">Mật khẩu hiện tại: <span class="required">*</span></label>
                                <input id="currentPassword" v-model="changePasswordForm.currentPassword"
                                    placeholder="Mật khẩu hiện tại" type="password"
                                    :class="{ 'input-error': errors.currentPassword }" autocomplete="off" />
                                <span v-if="errors.currentPassword" class="error-msg">{{ errors.currentPassword
                                }}</span>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="password">Mật khẩu mới: <span class="required">*</span></label>
                                    <input id="password" v-model="changePasswordForm.password"
                                        placeholder="Mật khẩu mới" type="password"
                                        :class="{ 'input-error': errors.password }" autocomplete="off" />
                                    <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
                                </div>
                                <div class="form-group">
                                    <label for="passwordRepeat">Nhập lại mật khẩu mới: <span
                                            class="required">*</span></label>
                                    <input id="passwordRepeat" v-model="changePasswordForm.passwordRepeat"
                                        placeholder="Nhập lại mật khẩu mới" type="password"
                                        :class="{ 'input-error': errors.passwordRepeat }" autocomplete="off" />
                                    <span v-if="errors.passwordRepeat" class="error-msg">{{ errors.passwordRepeat
                                    }}</span>
                                </div>
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
                            <div class="form-row">
                                <button type="submit" class="btn btn-primary" :disabled="loadding">
                                    <span v-if="loadding" class="spinner" style="margin-right:6px;"></span>
                                    Đổi mật khẩu
                                </button>
                                <button type="button" @click="cancelChangePassword"
                                    class="btn btn-secondary">Hủy</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="tab-pane" v-if="activeTab === 2">
                    <div class="profile-card">
                        <h2>Lịch sử hoạt động</h2>
                        <div class="activity-log">
                            <template v-if="activityLoading">
                                <p>Đang tải lịch sử hoạt động...</p>
                            </template>
                            <template v-else-if="activityLogs.length === 0">
                                <p style="color:#888">Chưa có hoạt động nào.</p>
                            </template>
                            <ul v-else class="activity-list">
                                <li v-for="log in activityLogs" :key="log.id" class="activity-item">
                                    <span class="activity-time">{{ formatDate(log.created_at) }}</span>
                                    <span class="activity-action">{{ log.action }}</span>
                                    <span class="activity-entity">{{ log.entity_type }}</span>
                                    <span class="activity-message" v-if="log.data && log.data.message">- {{
                                        log.data.message }}</span>
                                    <span class="activity-data" v-else>
                                        <template v-for="(value, key) in log.data">
                                            <p>- {{ key }}: {{ value }} </p>
                                        </template>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseToast from '~/components/admin/base/BaseToast.vue'
import { formatDate } from '~/utils/date'
import { validateProfile, validatePassword } from '~/utils/fieldValidation.js'

const form = ref({
    name: '',
    email: '',
    phone: '',
    zalo: '',
    fb: '',
    Roles: [],
    created_at: '',
    created_by_name: ''
})

const changePasswordForm = ref({
    currentPassword: '',
    password: '',
    passwordRepeat: ''
})

const loadding = ref(false)
const errors = ref({})

// tab
const activeTab = ref(0)
const toastRef = ref()

// activity
const activityLogs = ref([])
const activityLoading = ref(false)

// Realtime password rules check
const passwordRules = computed(() => {
    const pw = changePasswordForm.value.password || ''
    return {
        length: pw.length >= 8,
        lower: /[a-z]/.test(pw),
        upper: /[A-Z]/.test(pw),
        digit: /\d/.test(pw)
    }
})


async function fetchProfile() {
    const res = await $fetch('/api/users/profile', { credentials: 'include' })
    form.value = res.user
}

// Xử lý cập nhật profile, chỉ gửi các trường cho phép chỉnh sửa
async function updateProfile() {
    errors.value = {};
    loadding.value = true;
    // Chỉ lấy các trường cho phép chỉnh sửa
    const payload = {
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        zalo: form.value.zalo,
        fb: form.value.fb
    };
    try {
        const newErrors = validateProfile(payload);
        errors.value = newErrors;
        if (Object.keys(newErrors).length > 0) {
            loadding.value = false;
            return;
        }

        const res = await $fetch('/api/users/profile', {
            method: 'PUT',
            body: payload,
            credentials: 'include'
        });
        form.value = res.user;
        // Hiển thị thông báo thành công nếu muốn
        toastRef.value?.open('Cập nhật thông tin thành công!', 'success', 3000);
        errors.value = {};
    } catch (err) {
        if (err?.data?.errors) errors.value = err.data.errors;
        // Hiển thị thông báo lỗi nếu muốn
        toastRef.value?.open('Cập nhật thông tin thất bại!', 'error', 3000);
    } finally {
        loadding.value = false;
    }
}

function cancelUpdate() {
    fetchProfile();
    errors.value = {};
}

async function changePassword() {
    errors.value = {};
    loadding.value = true;

    // Validate từng trường
    if (!changePasswordForm.value.currentPassword) {
        errors.value.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    // Validate mật khẩu mới
    const passwordError = validatePassword(changePasswordForm.value.password);
    if (passwordError) {
        errors.value.password = 'Mật khẩu mới không hợp lệ';
    }
    // Validate nhập lại mật khẩu
    if (!changePasswordForm.value.passwordRepeat) {
        errors.value.passwordRepeat = 'Vui lòng nhập lại mật khẩu mới';
    } else if (changePasswordForm.value.password !== changePasswordForm.value.passwordRepeat) {
        errors.value.passwordRepeat = 'Mật khẩu nhập lại không khớp';
    }
    if (Object.keys(errors.value).length > 0) {
        loadding.value = false;
        return;
    }
    try {
        await $fetch('/api/users/profile/password', {
            method: 'PUT',
            body: {
                currentPassword: changePasswordForm.value.currentPassword,
                password: changePasswordForm.value.password,
                passwordRepeat: changePasswordForm.value.passwordRepeat
            },
            credentials: 'include'
        });
        toastRef.value?.open('Đổi mật khẩu thành công!', 'success', 3000);
        changePasswordForm.value.currentPassword = '';
        changePasswordForm.value.password = '';
        changePasswordForm.value.passwordRepeat = '';
        errors.value = {};
    } catch (err) {
        if (err?.data?.errors) errors.value = err.data.errors;
        toastRef.value?.open('Đổi mật khẩu thất bại!', 'error', 3000);
    } finally {
        loadding.value = false;
    }
}

function cancelChangePassword() {
    changePasswordForm.value.password = '';
    changePasswordForm.value.passwordRepeat = '';
    errors.value = {};
}

async function fetchActivityLogs() {
    activityLoading.value = true;
    try {
        const res = await $fetch('/api/users/profile/activity-logs', { credentials: 'include' });
        activityLogs.value = res.logs || [];
    } catch (e) {
        activityLogs.value = [];
    } finally {
        activityLoading.value = false;
    }
}

onMounted(() => {
    fetchProfile();
    fetchActivityLogs();
})

definePageMeta({
    layout: "admin",
    middleware: 'auth',
    ssr: false,
});
</script>

<style scoped>
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

.tab-content {
    background: #fff;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
    padding: 24px 32px 18px 32px;
    width: 100%;
    max-height: calc(100vh - 250px);
    overflow-y: auto;
}

.profile-card h2 {
    margin-bottom: 20px;
    color: #333;
    font-size: 1.5em;
    font-weight: 600;
}

.activity-log {
    min-height: 80px;
    color: #555;
    font-size: 1rem;
}

.success-msg.success {
    color: #388e3c;
    background: #e8f5e9;
}

.success-msg.error {
    color: #d32f2f;
    background: #fff6f6;
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

/* Activity Log Styles */
.activity-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.activity-item {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    font-size: 15px;
    color: #333;
}

.activity-time {
    color: #888;
    margin-right: 10px;
    font-size: 13px;
}

.activity-action {
    font-weight: 600;
    margin-right: 8px;
    color: #1976d2;
}

.activity-entity {
    color: #7b1fa2;
    margin-right: 8px;
}

.activity-message {
    color: #555;
}

@media screen and (max-width: 768px) {
    .tab-content {
        max-height: calc(100vh - 210px);
        overflow-y: auto;
    }
}
</style>