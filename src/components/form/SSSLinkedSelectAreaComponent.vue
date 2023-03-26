<script setup lang="ts">
import { ref, watch } from "vue";
import { getMultisigAddresses } from "@/apis/account";
import type { SelectboxItemModel } from "@/models/interfaces/SelectboxItemModel";
import { useSettingsStore } from "@/stores/settings";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { useSSSStore } from "@/stores/sss";
import SelectboxComponent from "./SelectboxComponent.vue";

// Stores
const settingsStore = useSettingsStore();
const sssStore = useSSSStore();
const writeMosaicStore = useWriteMosaicStore();

// Reactives
const addresses = ref<Array<SelectboxItemModel>>([]);

// Watch
watch(
  () => [sssStore.sssLinked, settingsStore.useSSS],
  async (): Promise<void> => {
    const logTitle = "sss linked selectbox area watch:";
    settingsStore.logger.debug(logTitle, "start", {
      sssLinked: sssStore.sssLinked,
      sssUse: settingsStore.useSSS,
    });

    // SSS連携状況と設定から連携アドレスを取得
    const addressStr =
      sssStore.sssLinked && settingsStore.useSSS
        ? sssStore.address
        : settingsStore.account?.address.plain() || "";

    // 連携アドレスを追加
    addresses.value.push({
      key: addressStr,
      value: addressStr,
      display: addressStr,
    });
    writeMosaicStore.ownerAddress = addressStr;
    // 連携アドレスのマルチシグアドレスを追加
    const multisigAddresses = await getMultisigAddresses(addressStr);
    for (let idx = 0; idx < multisigAddresses.length; idx++) {
      addresses.value.push({
        key: multisigAddresses[idx].plain(),
        value: multisigAddresses[idx].plain(),
        display: "(multisig) " + multisigAddresses[idx].plain(),
      });
    }
    settingsStore.logger.debug(logTitle, "end");
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
        v-bind:attributes="{
          ariaLabel: 'address',
        }"
        v-bind:items="addresses"
      />
    </div>
  </div>
</template>
