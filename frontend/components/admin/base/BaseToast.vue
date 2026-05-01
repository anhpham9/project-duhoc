<template>
    <Teleport to="body">
        <Transition name="toast" appear>
            <div v-if="notification.show" :class="['toast', notification.type]"
                @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
                <i :class="notification.icon"></i>
                <span>{{ notification.message }}</span>
                <button @click="hideNotification" class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const notification = ref({
    show: false,
    message: '',
    type: 'success', // success, error, warning, info
    icon: 'fas fa-check-circle'
})
let timeoutId = null
let remaining = 0
let lastStart = 0
const isHovering = ref(false)

const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-times-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
}

function open(msg, toastType = 'success', duration = 3000) {
    notification.value.message = msg
    notification.value.type = toastType
    notification.value.icon = iconMap[toastType] || iconMap.info
    notification.value.show = true
    clearTimeout(timeoutId)
    remaining = duration
    lastStart = Date.now()
    timeoutId = setTimeout(hideIfNotHover, duration)
}

function close() {
    notification.value.show = false
}

function hideNotification() {
    notification.value.show = false
    clearTimeout(timeoutId)
}

function hideIfNotHover() {
    if (!isHovering.value) {
        notification.value.show = false
    } else {
        // Đợi khi mouseleave mới ẩn
        // Không set lại timeout ở đây, mouseleave sẽ xử lý
    }
}

function onMouseEnter() {
    isHovering.value = true
    // Tính lại thời gian còn lại
    remaining -= Date.now() - lastStart
    clearTimeout(timeoutId)
}

function onMouseLeave() {
    isHovering.value = false
    lastStart = Date.now()
    timeoutId = setTimeout(hideIfNotHover, remaining > 0 ? remaining : 1000)
}

defineExpose({ open, close })
</script>

<style>
/* Global Toast Notification Styles - No scoped để work với Teleport */
.toast {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    padding: 16px 20px !important;
    border-radius: 8px !important;
    background: white !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    z-index: 999999 !important;
    min-width: 300px !important;
    max-width: 500px !important;
    border-left: 4px solid !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    pointer-events: auto !important;
    transform: translateZ(0) !important;
    /* Đảm bảo visible */
    visibility: visible !important;
    opacity: 1 !important;
    cursor: pointer;
}

.toast > i {
    font-size: 30px !important;
}

/* Vue Transition Classes */
.toast-enter-active {
    transition: all 0.3s ease-out !important;
}

.toast-leave-active {
    transition: all 0.3s ease-in !important;
}

.toast-enter-from {
    transform: translateX(100%) !important;
    opacity: 0 !important;
}

.toast-leave-to {
    transform: translateX(100%) !important;
    opacity: 0 !important;
}

/* Toast Type Colors */
.toast.success {
    border-left-color: #10b981 !important;
    background: #f0fdf4 !important;
}

.toast.success i {
    color: #10b981 !important;
}

.toast.error {
    border-left-color: #ef4444 !important;
    background: #fef2f2 !important;
}

.toast.error i {
    color: #ef4444 !important;
}

.toast.warning {
    border-left-color: #f59e0b !important;
    background: #fffbeb !important;
}

.toast.warning i {
    color: #f59e0b !important;
}

.toast.info {
    border-left-color: #3b82f6 !important;
    background: #eff6ff !important;
}

.toast.info i {
    color: #3b82f6 !important;
}

.toast span {
    flex: 1 !important;
    color: #374151 !important;
    line-height: 1.5 !important;
}

.toast-close {
    background: none !important;
    border: none !important;
    cursor: pointer !important;
    padding: 4px !important;
    border-radius: 4px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: background-color 0.2s !important;
    color: #6b7280 !important;
}

.toast-close:hover {
    background: rgba(0, 0, 0, 0.1) !important;
    color: #374151 !important;
}

.toast-close i {
    font-size: 20px !important;
}

/* Responsive Design */
@media (max-width: 640px) {
    .toast {
        top: 10px !important;
        right: 10px !important;
        left: 10px !important;
        min-width: auto !important;
        max-width: none !important;
    }
}
</style>
