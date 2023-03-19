<script setup lang="ts">
import { useSettingsStore } from "@/stores/settings";
import { useChainStore } from "@/stores/chain";
import NetworkTypeAreaComponent from "@/components/settings/NetworkTypeAreaComponent.vue";
import PrivateKeyAreaComponent from "@/components/settings/PrivateKeyAreaComponent.vue";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();
</script>

<template>
  <section class="container animate__animated animate__fadeIn">
    <NetworkTypeAreaComponent v-model:value="chainStore.networkType" />
    <div class="row my-2">
      <label class="col-md-6 col-form-label">{{ $t("settings.useSSS") }}</label>
      <div class="col-md-6">
        <select class="form-select">
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </div>
    </div>
    <PrivateKeyAreaComponent v-model:value="settingsStore.privateKey" />
  </section>
</template>
