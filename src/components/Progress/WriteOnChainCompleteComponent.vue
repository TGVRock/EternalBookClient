<script setup lang="ts">
import { onMounted } from "vue";

/**
 * 表示時処理
 */
onMounted(() => {
  // 書き込み完了後、 LocalStorage のデータをクリアする
  localStorage.clear();
});
</script>

<template>
  <div class="text-center my-5">
    <h3>Complete !</h3>
  </div>
</template>
