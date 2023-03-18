<script setup lang="ts">
// Props
defineProps<{
  /** 表示項目名 */
  itemName: string;
  /** 遷移先のルート名 */
  nextRouteName: string;
}>();
</script>

<template>
  <div class="row my-2">
    <div class="col-sm-12">
      <RouterLink v-bind:to="{ name: nextRouteName }">
        <button type="button" class="btn btn-primary">{{ itemName }}</button>
      </RouterLink>
    </div>
  </div>
</template>
