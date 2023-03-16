<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import LocaleMenuComponent from "@/components/header/LocaleMenuComponent.vue";
import NetworkTypeMenuComponent from "@/components/header/NetworkTypeMenuComponent.vue";

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
      <button
        class="navbar-toggler"
        type="button"
        v-on:click.stop="onClickToggle"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" v-bind:class="{ show: isShow }">
        <div class="navbar-nav me-auto my-2 my-lg-0 ms-2 ms-lg-0">
          <RouterLink
            class="nav-link ps-2"
            v-bind:to="{ name: 'WriterTop' }"
            v-on:click="onClickClose"
          >
            Writer
          </RouterLink>
          <RouterLink
            class="nav-link ps-2"
            v-bind:to="{ name: 'ViewerTop' }"
            v-on:click="onClickClose"
          >
            Viewer
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
.router-link-active {
  background-color: rgba(200, 219, 241, 0.678);
  color: rgba(210, 112, 255, 0.3);
  cursor: default;
  pointer-events: none;
}
</style>
