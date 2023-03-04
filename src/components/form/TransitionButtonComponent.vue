<script setup lang="ts">
// Props
defineProps<{
  itemName: string; // 表示項目名
  nextRouteName: string; // 遷移先のルート名
}>();
</script>

<template>
  <div class="row my-2">
    <div class="col-sm-12 text-center">
      <RouterLink v-bind:to="{ name: nextRouteName }">
        <button type="button" class="btn btn-primary">{{ itemName }}</button>
      </RouterLink>
    </div>
  </div>
</template>
