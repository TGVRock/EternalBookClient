<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import HeaderComponent from "./components/header/HeaderComponent.vue";
import { useChainStore } from "./stores/chain";
import { useSettingsStore } from "./stores/settings";
import { useSSSStore } from "./stores/sss";

// Initialize Stores
const settingStore = useSettingsStore();
useChainStore();
useSSSStore();
// Router
const router = useRouter();

// ルートURIの設定
settingStore.rootUri =
  window.location.origin +
  router.resolve({
    name: "home",
  }).href;
</script>

<template>
  <header>
    <HeaderComponent />
  </header>
  <main>
    <RouterView />
  </main>
</template>
