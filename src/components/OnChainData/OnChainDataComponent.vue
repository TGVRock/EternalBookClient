<script setup lang="ts">
import type { OnChainData } from "@/models/OnChainDataModel";
import OnChainDataRowComponent from "./OnChainDataRowComponent.vue";

// Props
defineProps<{
  onChainDataList: OnChainData[]; // オンチェーンデータリスト
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
