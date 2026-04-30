import { ref } from 'vue'
import * as XLSX from 'xlsx'

/**
 * exportExcel composable
 * @returns { exportToExcel, exportingExcel }
 */
export function exportExcel() {
    const exportingExcel = ref(false)

    /**
     * Export data to Excel
     * @param {Object[]} data - Array of objects to export
     * @param {Object[]} columns - Array of { label, key, width } for Excel columns
     * @param {string} filenamePrefix - Prefix for the exported file name
     * @param {Function} [onSuccess] - Optional callback on success
     * @param {Function} [onError] - Optional callback on error
     */
    const exportToExcel = async ({ data, columns, filenamePrefix = 'export', onSuccess, onError }) => {
        if (!data || data.length === 0) {
            if (onError) onError('Không có dữ liệu để xuất')
            return
        }
        exportingExcel.value = true
        try {
            // Prepare data for export
            const exportData = data.map((row, idx) => {
                const obj = {}
                columns.forEach(col => {
                    obj[col.label] = typeof col.value === 'function' ? col.value(row, idx) : row[col.key]
                })
                return obj
            })
            // Create workbook
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.json_to_sheet(exportData)
            // Set column widths
            ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }))
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
            // Filename
            const now = new Date()
            const dateStr = now.toISOString().split('T')[0]
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '')
            const filename = `${filenamePrefix}_${dateStr}_${timeStr}.xlsx`
            XLSX.writeFile(wb, filename)
            if (onSuccess) onSuccess(`Đã xuất ${data.length} dòng ra file Excel thành công!`)
        } catch (error) {
            if (onError) onError('Có lỗi xảy ra khi xuất file Excel')
            // eslint-disable-next-line no-console
            console.error('Export error:', error)
        } finally {
            exportingExcel.value = false
        }
    }

    return { exportToExcel, exportingExcel }
}
