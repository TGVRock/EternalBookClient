<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { MosaicInfo } from "symbol-sdk";
import MosaicInfoComponent from "@/components/MosaicInfo/MosaicInfoComponent.vue";
import ProcessingComponent from "./ProcessingComponent.vue";
import { useSettingsStore } from "@/stores/settings";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import { getMosaicInfo } from "@/apis/mosaic";
import CONSTS from "@/utils/consts";

// Stores
const settingsStore = useSettingsStore();
const writeOnChainDataStore = useWriteOnChainDataStore();
// Router
const router = useRouter();

// Reactives
const mosaicInfo = ref<MosaicInfo | undefined>(undefined);

// モザイク情報の取得
getMosaicInfo(writeOnChainDataStore.relatedMosaicIdStr)
  .then((value) => {
    settingsStore.logger.debug(
      "create mosaic complete:",
      "get mosaic info complete."
    );
    mosaicInfo.value = value;
  })
  .catch((error) => {
    settingsStore.logger.error(
      "create mosaic complete:",
      "get mosaic info failed.",
      error
    );
  });

// 一定時間後にオンチェーンデータ書き込みに移行する
setTimeout(() => {
  router.push({ name: CONSTS.ROUTENAME_WRITER_WRITE_ONCHAIN_DATA });
}, 10 * 1000);
</script>

<template>
  <div class="text-center my-5">
    <h3>Complete !</h3>
  </div>
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
