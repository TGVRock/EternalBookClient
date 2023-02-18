<script setup lang="ts">
import OnChainDataRowComponent from "./OnChainDataRowComponent.vue";
import type { OnChainData } from "@/models/OnChainDataModel";

defineProps<{
  onChainDataList: OnChainData[] | undefined;
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
