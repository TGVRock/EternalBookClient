<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderComponent from "./components/header/HeaderComponent.vue";
import { useChainStore } from "./stores/chain";
import { useSettingsStore } from "./stores/settings";
import { useSSSStore } from "./stores/sss";

// Initialize Stores
useSettingsStore();
useChainStore();
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
