<script setup lang="ts">
// Props
defineProps<{
  /** 行タイトル */
  title: string;
  /** データ */
  data: string;
}>();
</script>

<template>
  <div class="row">
    <div class="col-3">
      <p>{{ title }}</p>
    </div>
    <div class="col-9">
      <p>{{ data }}</p>
    </div>
  </div>
</template>

<style scoped>
div {
  white-space: pre-wrap;
}
</style>
