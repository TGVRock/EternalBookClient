<script setup lang="ts">
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import MosaicInfoComponent from "@/components/MosaicInfo/MosaicInfoComponent.vue";
import { useRouter } from "vue-router";
import { getMosaicInfo } from "@/apis/mosaic";

const writeOnChainDataStore = useWriteOnChainDataStore();
const router = useRouter();

setTimeout(() => {
  router.push({ name: "WriteOnChainData" });
}, 10 * 1000);
</script>

<template>
  <div class="text-center my-5">
    <h3>Complete !</h3>
  </div>
  <MosaicInfoComponent
    v-bind:mosaic-info="getMosaicInfo(writeOnChainDataStore.relatedMosaicIdStr)"
    class="container animate__animated animate__fadeIn text-break"
  />
</template>
