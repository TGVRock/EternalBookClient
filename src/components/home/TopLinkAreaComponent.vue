<script setup lang="ts">
import TransitionButtonComponent from "@/components/form/TransitionButtonComponent.vue";

// Props
defineProps<{
  /** 機能名 */
  functionName: string;
  /** 遷移先のルート名 */
  nextRouteName: string;
}>();
</script>

<template>
  <section class="row my-2 text-center text-lg-start">
    <TransitionButtonComponent
      class="col-lg-3 col-xl-2"
      v-bind:next-route-name="nextRouteName"
      v-bind:item-name="$t(functionName + `.title`)"
    />
    <div class="col-lg-9 col-xl-10">
      <p>{{ $t(functionName + `.explanation`) }}</p>
    </div>
  </section>
</template>

<style scoped>
section {
  white-space: pre-wrap;
}
</style>
