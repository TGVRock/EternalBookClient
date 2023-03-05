<script setup lang="ts">
import { ref, watch } from "vue";
import { getMultisigAddresses } from "@/apis/account";
import type { SelectboxItemModel } from "@/models/SelectboxItemModel";
import type { SelectboxAttributeModel } from "@/models/SelectboxAttributeModel";
import { useEnvironmentStore } from "@/stores/environment";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { getAddress } from "@/utils/sss";
import SelectboxComponent from "./SelectboxComponent.vue";

// Stores
const envStore = useEnvironmentStore();
const writeMosaicStore = useWriteMosaicStore();

// Reactives
const addresses = ref<Array<SelectboxItemModel>>([]);
const attributes = ref<SelectboxAttributeModel>({
  ariaLabel: "address",
});

// Watch
watch(
  () => envStore.sssLinked,
  async (): Promise<void> => {
    const logTitle = "sss linked selectbox area watch:";
    envStore.logger.debug(logTitle, "start", envStore.sssLinked);

    // SSS 連携アドレスを追加
    const linkedAddress = getAddress();
    addresses.value.push({
      key: linkedAddress,
      value: linkedAddress,
      display: linkedAddress,
    });
    writeMosaicStore.linkedAddress = linkedAddress;
    writeMosaicStore.ownerAddress = linkedAddress;
    // SSS 連携アドレスのマルチシグアドレスを追加
    const multisigAddresses = await getMultisigAddresses(linkedAddress);
    for (let idx = 0; idx < multisigAddresses.length; idx++) {
      addresses.value.push({
        key: multisigAddresses[idx].plain(),
        value: multisigAddresses[idx].plain(),
        display: "(multisig) " + multisigAddresses[idx].plain(),
      });
    }
    envStore.logger.debug(logTitle, "end");
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
      <SelectboxComponent
        v-model:value="writeMosaicStore.ownerAddress"
        v-bind:attributes="attributes"
        v-bind:items="addresses"
      />
    </div>
  </div>
</template>
