<script setup lang="ts">
import { ref, watch } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useEnvironmentStore } from "@/stores/environment";
import { getAddress } from "@/utils/sss";
import LocaleMenuComponent from "@/components/LocaleMenuComponent.vue";
import NetworkTypeMenuComponent from "@/components/NetworkTypeMenuComponent.vue";

// Stores
const envStore = useEnvironmentStore();
const linkedAddress = ref("");

watch(
  () => envStore.sssLinked,
  async (): Promise<void> => {
    linkedAddress.value = getAddress();
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <header class="sticky-top">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" v-bind:to="{ name: 'home' }">
          EternalBookClient
        </RouterLink>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" v-bind:to="{ name: 'WriterTop' }">
                Writer
              </RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" v-bind:to="{ name: 'ViewerTop' }">
                Viewer
              </RouterLink>
            </li>
          </ul>
          <div class="d-flex me-2">
            <NetworkTypeMenuComponent />
          </div>
          <div v-if="envStore.sssLinked" class="d-flex me-2">
            {{ linkedAddress }}
          </div>
          <div class="d-flex me-2">
            <LocaleMenuComponent />
          </div>
        </div>
      </div>
    </nav>
  </header>

  <RouterView />
</template>

<!-- <style scoped>
</style> -->
