<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderComponent from "./components/header/HeaderComponent.vue";
import { useEnvironmentStore } from "./stores/environment";
import { useSSSStore } from "./stores/sss";

// Initialize Stores
useEnvironmentStore();
useSSSStore();
</script>

<template>
  <header>
    <HeaderComponent />
  </header>
  <main>
    <RouterView />
  </main>
</template>
