<script setup lang="ts">
import type { OnChainData } from "@/models/interfaces/OnChainDataModel";
import OnChainDataRowComponent from "./flagments/OnChainDataRowComponent.vue";

// Props
defineProps<{
  /** オンチェーンデータリスト */
  onChainDataList: OnChainData;
}>();
</script>

<template>
  <article class="container">
    <OnChainDataRowComponent
      v-bind:key="`chain-data-${onChainDataList.date}`"
      v-bind:data="onChainDataList"
    />
  </article>
</template>
