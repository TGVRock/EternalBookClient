<script setup lang="ts">
import { ref, watch } from "vue";
import type { MosaicInfo, NetworkType } from "symbol-sdk";
import type { OnChainData } from "@/models/OnChainDataModel";
import { getMosaicInfo } from "@/apis/mosaic";
import { getEBPOnChainData } from "@/utils/eternalbookprotocol";
import ProcessingComponent from "@/components/ProcessingComponent.vue";
import MosaicInfoComponent from "@/components/MosaicInfo/MosaicInfoComponent.vue";
import OnChainDataComponent from "@/components/OnChainData/OnChainDataComponent.vue";

// FIXME: ネットワークタイプ指定できない

const props = defineProps<{
  netType: NetworkType;
  mosaicId: string;
}>();

const mosaicInfo = ref<MosaicInfo | undefined>(undefined);
const onChainDataList = ref<OnChainData[] | undefined>(undefined);

getMosaicInfo(props.mosaicId).then((value) => {
  mosaicInfo.value = value;
});
watch(mosaicInfo, (): void => {
  if (typeof mosaicInfo.value === "undefined") {
    onChainDataList.value = undefined;
    return;
  }
  getEBPOnChainData(mosaicInfo.value as MosaicInfo).then((value) => {
    onChainDataList.value = value;
  });
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
