<script setup lang="ts">
import TransitionButtonComponent from "@/components/form/TransitionButtonComponent.vue";

// Props
defineProps<{
  /** 機能名 */
  functionName: string;
  /** 遷移先のルート名 */
  nextRouteName: string;
  /** 注釈の有無 */
  existAnnotation?: boolean;
  /** 無効かどうか */
  isDisabled?: boolean;
}>();
</script>

<template>
  <section class="row my-2 text-center text-lg-start">
    <TransitionButtonComponent
      class="col-lg-3 col-xl-2"
      v-bind:next-route-name="nextRouteName"
      v-bind:item-name="$t(functionName + `.title`)"
      v-bind:is-disabled="isDisabled"
    />
    <div class="col-lg-9 col-xl-10">
      <p>{{ $t(functionName + `.explanation`) }}</p>
      <p v-if="existAnnotation" class="text-danger">
        {{ $t(functionName + `.annotation`) }}
      </p>
    </div>
  </section>
</template>

<style scoped>
section {
  white-space: pre-wrap;
}
</style>
