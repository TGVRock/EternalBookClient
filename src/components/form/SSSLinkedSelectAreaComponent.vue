<script setup lang="ts">
import { ref, watch } from "vue";
import { getMultisigAddresses } from "@/apis/account";
import type { SelectboxItemModel } from "@/models/SelectboxItemModel";
import type { SelectboxAttributeModel } from "@/models/SelectboxAttributeModel";
import { useEnvironmentStore } from "@/stores/environment";
import { useSSSStore } from "@/stores/sss";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import SelectboxComponent from "./SelectboxComponent.vue";

// Stores
const envStore = useEnvironmentStore();
const sssStore = useSSSStore();
const writeMosaicStore = useWriteMosaicStore();

// Reactives
const addresses = ref<Array<SelectboxItemModel>>([]);
const attributes = ref<SelectboxAttributeModel>({
  ariaLabel: "address",
});

// Watch
watch(
  () => sssStore.sssLinked,
  async (): Promise<void> => {
    const logTitle = "sss linked selectbox area watch:";
    envStore.logger.debug(logTitle, "start", sssStore.sssLinked);

    // SSS 連携アドレスを追加
    addresses.value.push({
      key: sssStore.address,
      value: sssStore.address,
      display: sssStore.address,
    });
    writeMosaicStore.linkedAddress = sssStore.address;
    writeMosaicStore.ownerAddress = sssStore.address;
    // SSS 連携アドレスのマルチシグアドレスを追加
    const multisigAddresses = await getMultisigAddresses(sssStore.address);
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
