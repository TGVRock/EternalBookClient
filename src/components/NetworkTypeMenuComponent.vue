<script setup lang="ts">
// TODO: コード整理
import { ref, computed } from "vue";
import { NetworkType } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";
import { isSSSEnable, getNetworkType } from "@/utils/sss";

const environmentStore = useEnvironmentStore();

const networkTypeList = ref({
  MAIN: NetworkType.MAIN_NET,
  TEST: NetworkType.TEST_NET,
});

const isSSSLinked = computed(() => {
  return isSSSEnable();
});
const netType = getNetworkType();
if (netType !== undefined) {
  environmentStore.networkType = netType;
}
</script>

<template>
  <select
    v-model="environmentStore.networkType"
    v-bind:disabled="isSSSLinked"
    class="form-select-sm"
    aria-label="network-type"
  >
    <option
      v-for="(value, key) in networkTypeList"
      v-bind:key="`network-type-${value}`"
      v-bind:value="value"
    >
      {{ key }}
    </option>
  </select>
</template>
