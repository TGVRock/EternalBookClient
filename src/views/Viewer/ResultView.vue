<script setup lang="ts">
import { ref, watch } from "vue";
import type { MosaicInfo, NetworkType } from "symbol-sdk";
import ProcessingComponent from "@/components/ProcessingComponent.vue";
import MosaicInfoComponent from "@/components/MosaicInfo/MosaicInfoComponent.vue";
import OnChainDataComponent from "@/components/OnChainData/OnChainDataComponent.vue";
import { useEnvironmentStore } from "@/stores/environment";
import type { OnChainData } from "@/models/OnChainDataModel";
import { getMosaicInfo } from "@/apis/mosaic";
import { getEBPOnChainData } from "@/utils/eternalbookprotocol";

// FIXME: ネットワークタイプ指定できない

// Stores
const envStore = useEnvironmentStore();

// Props
const props = defineProps<{
  netType: NetworkType;
  mosaicId: string;
}>();

const mosaicInfo = ref<MosaicInfo | undefined>(undefined);
const onChainDataList = ref<OnChainData[] | undefined>(undefined);

// モザイク情報の取得
getMosaicInfo(props.mosaicId)
  .then((value) => {
    envStore.logger.debug("viewer result:", "get mosaic info complete.");
    mosaicInfo.value = value;
  })
  .catch((error) => {
    envStore.logger.error("viewer result:", "get mosaic info failed.", error);
  });

// Watch
watch(mosaicInfo, async (): Promise<void> => {
  const logTitle = "viewer result watch:";
  envStore.logger.debug(logTitle, "start", mosaicInfo.value);

  // モザイクに紐づいたオンチェーンデータを取得
  if (typeof mosaicInfo.value === "undefined") {
    envStore.logger.error(logTitle, "not exist mosaic info.");
    onChainDataList.value = undefined;
    return;
  }
  getEBPOnChainData(mosaicInfo.value as MosaicInfo)
    .then((value) => {
      envStore.logger.debug(logTitle, "get on chain data complete.");
      onChainDataList.value = value;
    })
    .catch((error) => {
      envStore.logger.error(logTitle, "get on chain data failed.", error);
    });
  envStore.logger.debug(logTitle, "end");
});
</script>

<template>
  <ProcessingComponent
    v-if="typeof onChainDataList === 'undefined'"
    v-bind:message="$t('message.loading')"
  />
  <OnChainDataComponent
    v-else
    v-bind:onChainDataList="onChainDataList"
    class="container animate__animated animate__fadeIn text-break"
  />
  <ProcessingComponent
    v-if="typeof mosaicInfo === 'undefined'"
    v-bind:message="$t('message.loading')"
  />
  <MosaicInfoComponent
    v-else
    v-bind:mosaic-info="(mosaicInfo as MosaicInfo)"
    class="container animate__animated animate__fadeIn text-break"
  />
</template>
