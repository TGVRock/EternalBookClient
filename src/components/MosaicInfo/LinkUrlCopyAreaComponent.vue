<script setup lang="ts">
import TextCopyComponent from "@/components/form/TextCopyComponent.vue";

// Props
defineProps<{
  /** リンクURL */
  linkUrl: string;
}>();
</script>

<template>
  <article class="container">
    <div class="row my-2">
      <div class="col-3 col-form-label">
        <p>{{ $t("viewer.linkUrl") }}</p>
      </div>
      <div class="col-9">
        <TextCopyComponent v-bind:text="linkUrl" />
      </div>
    </div>
  </article>
</template>

<style scoped>
div {
  white-space: pre-wrap;
}
</style>
