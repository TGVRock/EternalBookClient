<script setup lang="ts">
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
import TransitionButtonComponent from "@/components/form/TransitionButtonComponent.vue";

// Stores
const writeOnChainDataStore = useWriteOnChainDataStore();
</script>

<template>
  <section>
    <TextAreaComponent
      v-bind:item-name="$t('mosaicInfo.id')"
      v-bind:placeholder="
        $t('writer.pleaseInputItem', { item: $t('mosaicInfo.id') })
      "
      v-model:value="writeOnChainDataStore.relatedMosaicIdStr"
    />
    <TransitionButtonComponent
      class="text-center"
      v-bind:next-route-name="`WriteOnChainData`"
      v-bind:item-name="$t(`writer.writeOnChain`)"
    />
  </section>
</template>
