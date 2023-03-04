<script setup lang="ts">
// Props
defineProps<{
  title: string; // 行タイトル
  data: string; // データ
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
