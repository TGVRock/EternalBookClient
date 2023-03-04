<script setup lang="ts">
import { ref } from "vue";
import { NetworkType } from "symbol-sdk";
import type { SelectboxItemModel } from "@/models/SelectboxItemModel";
import type { SelectboxAttributeModel } from "@/models/SelectboxAttributeModel";
import { useEnvironmentStore } from "@/stores/environment";
import { getNetworkType } from "@/utils/sss";
import CONSTS from "@/utils/consts";
import SelectboxComponent from "@/components/form/SelectboxComponent.vue";

// Stores
const environmentStore = useEnvironmentStore();

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
  disabled: environmentStore.sssLinked,
});

// SSSで連携されているネットワークタイプを設定
const netType = getNetworkType();
if (netType !== CONSTS.NETWORKTYPE_INVALID) {
  environmentStore.networkType = netType;
}
</script>

<template>
  <SelectboxComponent
    v-model:value="environmentStore.networkType"
    v-bind:attributes="attributes"
    v-bind:items="networks"
    size="sm"
  />
</template>
