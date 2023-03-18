<script setup lang="ts">
import type { RouteParamsRaw } from "vue-router";

// Props
defineProps<{
  /** 表示項目名 */
  itemName: string;
  /** 遷移先のルート名 */
  nextRouteName: string;
  /** パラメータ */
  params?: RouteParamsRaw;
}>();
</script>

<template>
  <div class="row my-2">
    <div class="col-sm-12">
      <RouterLink v-bind:to="{ name: nextRouteName, params: params }">
        <button type="button" class="btn btn-primary">{{ itemName }}</button>
      </RouterLink>
    </div>
  </div>
</template>
