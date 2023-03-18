<script setup lang="ts">
import type { OnChainData } from "@/models/interfaces/OnChainDataModel";
import OnChainDataRowComponent from "./flagments/OnChainDataRowComponent.vue";

// Props
defineProps<{
  /** オンチェーンデータリスト */
  onChainDataList: OnChainData[];
}>();
</script>

<template>
  <article class="container">
    <OnChainDataRowComponent
      v-for="data in onChainDataList"
      v-bind:key="`chain-data-${data.date}`"
      v-bind:data="data"
    />
  </article>
</template>
