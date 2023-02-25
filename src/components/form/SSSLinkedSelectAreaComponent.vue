<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { isSSSEnable, getAddress } from "@/utils/sss";
import type { Address } from "symbol-sdk";
import { getMultisigAddresses } from "@/apis/account";

const writeMosaicStore = useWriteMosaicStore();

const isSSSLinked = computed(() => {
  return isSSSEnable();
});
const sssLinkedAddress = computed(() => {
  return getAddress();
});

const multisigAddresses = ref<Array<Address>>([]);
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
