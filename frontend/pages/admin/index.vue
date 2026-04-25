<template>
    <div>
        <h1>noi dung page admin/index</h1>
    </div>
</template>
<script setup>
definePageMeta({
    layout: "admin",
    middleware: 'auth',
});
</script>