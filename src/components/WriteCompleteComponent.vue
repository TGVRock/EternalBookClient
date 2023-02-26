<script setup lang="ts">
// TODO: コード整理
import { ref } from "vue";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import MosaicInfoComponent from "@/components/MosaicInfo/MosaicInfoComponent.vue";
import { useRouter } from "vue-router";
import { getMosaicInfo } from "@/apis/mosaic";
import type { MosaicInfo } from "symbol-sdk";
import ProcessingComponent from "./ProcessingComponent.vue";

const writeOnChainDataStore = useWriteOnChainDataStore();
const router = useRouter();

const mosaicInfo = ref<MosaicInfo | undefined>(undefined);

getMosaicInfo(writeOnChainDataStore.relatedMosaicIdStr).then((value) => {
  mosaicInfo.value = value;
});

setTimeout(() => {
  router.push({ name: "WriteOnChainData" });
}, 10 * 1000);
</script>

<template>
  <div class="text-center my-5">
    <h3>Complete !</h3>
  </div>
  <ProcessingComponent
    v-if="undefined === mosaicInfo"
    v-bind:message="$t('message.loading')"
  />
  <MosaicInfoComponent
    v-else
    v-bind:mosaic-info="(mosaicInfo as MosaicInfo)"
    class="container animate__animated animate__fadeIn text-break"
  />
</template>
