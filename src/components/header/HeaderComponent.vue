<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import LocaleMenuComponent from "@/components/header/LocaleMenuComponent.vue";
import NetworkTypeMenuComponent from "@/components/header/NetworkTypeMenuComponent.vue";
import { useEnvironmentStore } from "@/stores/environment";

// Stores
const envStore = useEnvironmentStore();

// Reactives
const isShow = ref(false);

/**
 * 閉じるクリックイベント
 */
function onClickClose(): void {
  isShow.value = false;
}

/**
 * トグルクリックイベント
 */
function onClickToggle(): void {
  isShow.value = !isShow.value;
}
</script>

<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <RouterLink
        class="navbar-brand"
        v-bind:to="{ name: 'home' }"
        v-on:click="onClickClose"
      >
        EternalBookClient
      </RouterLink>
      <div class="navbar-toggler" v-on:click.stop="onClickToggle">
        <span class="navbar-toggler-icon"></span>
      </div>
      <div class="collapse navbar-collapse" v-bind:class="{ show: isShow }">
        <div class="navbar-nav me-auto my-2 my-lg-0 ms-2 ms-lg-0">
          <RouterLink
            v-if="envStore.isAvailable"
            class="nav-link ps-2"
            v-bind:to="{ name: 'WriterTop' }"
            v-on:click="onClickClose"
          >
            {{ $t(`writer.title`) }}
          </RouterLink>
          <RouterLink
            v-if="envStore.isAvailable"
            class="nav-link ps-2"
            v-bind:to="{ name: 'ViewerTop' }"
            v-on:click="onClickClose"
          >
            {{ $t(`viewer.title`) }}
          </RouterLink>
        </div>
        <div class="d-flex">
          <NetworkTypeMenuComponent class="me-2" />
          <LocaleMenuComponent class="me-2" />
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar-nav .router-link-active {
  background-color: rgba(200, 219, 241, 0.678);
  cursor: default;
  pointer-events: none;
}
</style>
