<script setup lang="ts">
// TODO: 内容をツールの説明にする
import { RouterLink } from "vue-router";
</script>

<template>
  <main>
    <RouterLink v-bind:to="{ name: 'WriterTop' }">
      <button>Writer</button>
    </RouterLink>
    <RouterLink v-bind:to="{ name: 'ViewerTop' }">
      <button>Viewer</button>
    </RouterLink>
  </main>
</template>
