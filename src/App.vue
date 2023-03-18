<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderComponent from "./components/header/HeaderComponent.vue";
</script>

<template>
  <header>
    <HeaderComponent />
  </header>
  <main>
    <RouterView />
  </main>
</template>
