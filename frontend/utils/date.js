export function formatDate(dateString) {
    if (!dateString) return '-'
    try {
        const date = new Date(dateString)
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return '-'
    }
}

export function formatSmartDate(dateString) {
    if (!dateString) return '-'
    try {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffSec = Math.floor(diffMs / 1000)
        const diffMin = Math.floor(diffSec / 60)
        const diffHour = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHour / 24)

        if (diffMin < 1) return 'Vừa xong'
        if (diffMin < 60) return `${diffMin} phút trước`
        if (diffHour < 24) return `${diffHour} giờ trước`

        // Nếu quá 24 giờ, hiển thị dạng HH:mm DD/MM/YYYY
        const pad = n => n.toString().padStart(2, '0')
        return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
    } catch (e) {
        return '-'
    }
}