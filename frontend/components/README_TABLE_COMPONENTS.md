# Hướng dẫn sử dụng các component bảng, phân trang, tìm kiếm dùng chung

## 1. BaseTable.vue
- Dùng slot `header` cho phần `<th>`, slot `body` cho `<tr>`.
- Ví dụ:
```vue
<BaseTable>
  <template #header>
    <th>ID</th>
    <th>Tên</th>
  </template>
  <template #body>
    <tr v-for="item in items" :key="item.id">
      <td>{{ item.id }}</td>
      <td>{{ item.name }}</td>
    </tr>
  </template>
</BaseTable>
```

## 2. BasePagination.vue
- Thuộc tính: `v-model` (số trang hiện tại), `:total-pages` (tổng số trang)
- Ví dụ:
```vue
<BasePagination v-model="page" :total-pages="totalPages" />
```

## 3. BaseSearchFilter.vue
- Thuộc tính: `v-model` (giá trị tìm kiếm)
- Sự kiện: `@update:search` (trigger khi nhập)
- Ví dụ:
```vue
<BaseSearchFilter v-model="search" @update:search="onSearchInput" />
```

## 4. Áp dụng cho các trang khác
- Import các component trên vào trang cần dùng.
- Thay thế phần table, phân trang, tìm kiếm bằng component tương ứng.
- Có thể custom slot, props theo nhu cầu.

---
**Lưu ý:**
- Logic fetch/filter/sort vẫn xử lý ở trang cha, component chỉ lo UI.
- Có thể mở rộng thêm slot cho toolbar, footer nếu cần.
