<script setup lang="ts">
// Props
defineProps<{
  /** 表示メッセージ */
  message: string;
}>();
</script>

<template>
  <div class="text-center my-5">
    <div class="spinner-border text-secondary" role="status">
      <span class="visually-hidden">{{ message }}</span>
    </div>
    <h3 class="animate__animated animate__fadeIn animate__infinite">
      {{ message }}
    </h3>
  </div>
</template>
