<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { NetworkType } from "symbol-sdk";
import LocaleMenuComponent from "@/components/header/LocaleMenuComponent.vue";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";
import CONSTS from "@/utils/consts";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();

// Reactives
const isShow = ref(false);
const netType = computed(() => {
  return chainStore.networkType === NetworkType.MAIN_NET ? "main" : "test";
});
const addressStr = computed(() => {
  return settingsStore.addressStr.length > 0 ? settingsStore.addressStr : "--";
});

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
        <img class="logo" src="/logo.svg" v-bind:alt="$t(`home.title`)" />
      </RouterLink>
      <div class="navbar-toggler" v-on:click.stop="onClickToggle">
        <span class="navbar-toggler-icon"></span>
      </div>
      <div class="collapse navbar-collapse" v-bind:class="{ show: isShow }">
        <div class="navbar-nav me-auto my-2 my-lg-0 ms-2 ms-lg-0">
          <RouterLink
            v-if="settingsStore.isAvailable"
            class="nav-link ps-2"
            v-bind:to="{ name: CONSTS.ROUTENAME_SETTINGS }"
            v-on:click="onClickClose"
          >
            {{ $t(`settings.title`) }}
          </RouterLink>
          <RouterLink
            v-if="settingsStore.isAvailable"
            class="nav-link ps-2"
            v-bind:class="{
              'router-link-disable': addressStr === '--',
            }"
            v-bind:to="{ name: CONSTS.ROUTENAME_WRITER_TOP }"
            v-on:click="onClickClose"
          >
            {{ $t(`writer.title`) }}
          </RouterLink>
          <RouterLink
            v-if="settingsStore.isAvailable"
            class="nav-link ps-2"
            v-bind:to="{ name: CONSTS.ROUTENAME_VIEWER_TOP }"
            v-on:click="onClickClose"
          >
            {{ $t(`viewer.title`) }}
          </RouterLink>
        </div>
        <div class="navbar-nav small text-break">
          <p class="me-2 my-auto">{{ $t(`networkTypes.` + netType) }}</p>
          <p class="mx-2 my-auto">
            {{ addressStr }}
          </p>
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
.navbar-nav .router-link-disable {
  background-color: rgba(230, 230, 230, 0.432);
  color: #fff;
  cursor: default;
  pointer-events: none;
}

.navbar-brand .logo {
  height: 30px;
}
</style>
