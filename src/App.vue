<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useSSSStore } from "./stores/sss";
import LocaleMenuComponent from "@/components/header/LocaleMenuComponent.vue";
import NetworkTypeMenuComponent from "@/components/header/NetworkTypeMenuComponent.vue";

// Stores
const sssStore = useSSSStore();
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
          <div v-if="sssStore.sssLinked" class="d-flex me-2">
            {{ sssStore.address }}
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
