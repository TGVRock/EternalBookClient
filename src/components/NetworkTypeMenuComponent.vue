<script setup lang="ts">
import { ref } from "vue";
import { NetworkType } from "symbol-sdk";
import type { SelectboxItemModel } from "@/models/SelectboxItemModel";
import type { SelectboxAttributeModel } from "@/models/SelectboxAttributeModel";
import { useEnvironmentStore } from "@/stores/environment";
import SelectboxComponent from "@/components/form/SelectboxComponent.vue";
import { useSSSStore } from "@/stores/sss";

// Stores
const envStore = useEnvironmentStore();
const sssStore = useSSSStore();

// Reactives
const networks = ref<Array<SelectboxItemModel>>([
  {
    key: "MAIN",
    value: NetworkType.MAIN_NET,
    display: "MAIN",
  },
  {
    key: "TEST",
    value: NetworkType.TEST_NET,
    display: "TEST",
  },
]);
const attributes = ref<SelectboxAttributeModel>({
  ariaLabel: "network-type",
  disabled: sssStore.sssLinked,
});
</script>

<template>
  <SelectboxComponent
    v-model:value="envStore.networkType"
    v-bind:attributes="attributes"
    v-bind:items="networks"
    size="sm"
  />
</template>
