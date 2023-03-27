<script setup lang="ts">
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import CreatedMosaicAreaComponent from "./flagments/CreatedMosaicAreaComponent.vue";
import TransitionButtonComponent from "@/components/form/TransitionButtonComponent.vue";

// Stores
const writeOnChainDataStore = useWriteOnChainDataStore();
</script>

<template>
  <section>
    <CreatedMosaicAreaComponent
      v-model:value="writeOnChainDataStore.relatedMosaicIdStr"
    />
    <TransitionButtonComponent
      class="text-center"
      v-bind:next-route-name="`WriteOnChainData`"
      v-bind:item-name="$t(`writer.writeOnChain`)"
    />
  </section>
</template>
