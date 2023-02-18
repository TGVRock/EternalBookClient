<script setup lang="ts">
defineProps<{
  title: string;
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
