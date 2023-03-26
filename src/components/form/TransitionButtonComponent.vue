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
  /** 無効かどうか */
  isDisabled?: boolean;
}>();
</script>

<template>
  <div class="row my-2">
    <div class="col-sm-12">
      <RouterLink
        v-bind:to="{ name: nextRouteName, params: params }"
        v-bind:class="{ disabled: isDisabled }"
      >
        <button
          type="button"
          class="btn btn-primary"
          v-bind:class="{ 'btn-secondary': isDisabled }"
          v-bind:disabled="isDisabled"
        >
          {{ itemName }}
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.disabled {
  cursor: default;
  pointer-events: none;
}
</style>
