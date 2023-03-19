<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useChainStore } from "@/stores/chain";
import { useSSSStore } from "@/stores/sss";
import NetworkTypeAreaComponent from "@/components/settings/NetworkTypeAreaComponent.vue";
import PrivateKeyAreaComponent from "@/components/settings/PrivateKeyAreaComponent.vue";
import UseSSSAreaComponent from "@/components/settings/UseSSSAreaComponent.vue";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();
const sssStore = useSSSStore();

// Reactives
const netType = ref(chainStore.networkType);
const useSSS = ref(settingsStore.useSSS);
const privateKey = ref(settingsStore.privateKey);
const isChanged = computed(() => {
  return (
    chainStore.networkType !== netType.value ||
    settingsStore.useSSS !== useSSS.value ||
    (useSSS.value === false && settingsStore.privateKey !== privateKey.value)
  );
});

/**
 * 表示時に設定を元に戻す
 */
onMounted(() => {
  netType.value = chainStore.networkType;
  useSSS.value = settingsStore.useSSS;
  privateKey.value = settingsStore.privateKey;
});

/**
 * 設定適用
 */
const onApply = (): void => {
  settingsStore.useSSS = useSSS.value;
  if (useSSS.value) {
    netType.value = sssStore.networkType;
    settingsStore.privateKey = "";
  } else {
    settingsStore.privateKey = privateKey.value;
  }
  chainStore.networkType = netType.value;
};
</script>

<template>
  <section class="container animate__animated animate__fadeIn">
    <NetworkTypeAreaComponent v-model:value="netType" />
    <UseSSSAreaComponent v-model:value="useSSS" />
    <PrivateKeyAreaComponent
      v-model:value="privateKey"
      v-bind:disabled="useSSS"
    />
    <div class="row my-2">
      <div class="col text-center">
        <button
          type="button"
          class="btn btn-primary"
          v-on:click="onApply"
          v-bind:disabled="!isChanged"
          v-bind:class="{ 'btn-secondary': !isChanged }"
        >
          {{ $t("settings.apply") }}
        </button>
      </div>
    </div>
  </section>
</template>
