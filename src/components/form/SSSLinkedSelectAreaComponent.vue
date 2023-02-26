<script setup lang="ts">
// TODO: コード整理
import { ref, computed, watch } from "vue";
import type { Address } from "symbol-sdk";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { getMultisigAddresses } from "@/apis/account";
import { isSSSEnable, getAddress } from "@/utils/sss";

// Stores
const writeMosaicStore = useWriteMosaicStore();

// Reactives
const multisigAddresses = ref<Array<Address>>([]);
const isSSSLinked = computed(() => {
  return isSSSEnable();
});
const sssLinkedAddress = computed(() => {
  return getAddress();
});

watch(
  isSSSLinked,
  async (): Promise<void> => {
    multisigAddresses.value = [];
    const linkedAddress = getAddress();
    if (undefined === linkedAddress) {
      return;
    }
    writeMosaicStore.linkedAddress = linkedAddress;
    writeMosaicStore.ownerAddress = linkedAddress;
    multisigAddresses.value = await getMultisigAddresses(linkedAddress);
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <div class="row my-2">
    <label class="col-md-3 col-form-label">
      {{ $t("mosaicInfo.address") }}
    </label>
    <div class="col-md-9">
      <select
        v-model="writeMosaicStore.ownerAddress"
        class="form-select"
        aria-label="network-type"
      >
        <option v-bind:value="sssLinkedAddress">
          {{ sssLinkedAddress }}
        </option>
        <option
          v-for="value in multisigAddresses"
          v-bind:key="`network-type-${value.plain()}`"
          v-bind:value="value.plain()"
        >
          &ensp;(multisig) {{ value.plain() }}
        </option>
      </select>
    </div>
  </div>
</template>
