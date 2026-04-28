<template>
    <div class="base-table-container">
        <slot name="table-toolbar"></slot>
        <table class="base-table">
            <thead>
                <tr>
                    <slot name="table-header"></slot>
                </tr>
            </thead>
            <tbody>
                <slot name="table-body"></slot>
            </tbody>
        </table>
        <slot name="table-footer"></slot>
    </div>
</template>

<script setup>
// Table is a presentational wrapper, logic handled by parent
</script>

<style>
.base-table-container {
    width: 100%;
    overflow-x: auto;
}

.base-table {
    width: 100%;
    min-width: 600px;
    border-collapse: collapse;
    background: #fff;
    font-size: 1em;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.base-table th,
.base-table td {
    border: 1px solid #e0e0e0;
    padding: 10px 14px;
    text-align: left;
    white-space: nowrap;
}

.base-table th.center,
.base-table td.center {
    text-align: center;
}

.base-table th {
    background: #f3f4f6;
    font-weight: 600;
    color: #222;
}

.base-table tbody tr:nth-child(even) {
    background: #fafbfc;
}

.base-table tbody tr:hover {
    background: #e0e7ff;
}
</style>
