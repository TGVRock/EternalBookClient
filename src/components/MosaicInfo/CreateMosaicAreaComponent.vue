<script setup lang="ts">
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import MosaicFlagAreaComponent from "../form/MosaicFlagAreaComponent.vue";
import NumberAreaComponent from "../form/NumberAreaComponent.vue";
import TransitionButtonComponent from "../form/TransitionButtonComponent.vue";
import CONSTS from "@/utils/consts";

// Stores
const writeMosaicStore = useWriteMosaicStore();
</script>

<template>
  <section>
    <MosaicFlagAreaComponent />
    <NumberAreaComponent
      v-bind:item-name="$t('mosaicInfo.supply')"
      v-bind:placeholder="
        $t('writer.pleaseInputItem', { item: $t('mosaicInfo.supply') })
      "
      v-model:value="writeMosaicStore.amount"
      v-bind:min="1"
    />
    <TransitionButtonComponent
      class="text-center"
      v-bind:next-route-name="CONSTS.ROUTENAME_WRITER_CREATE_MOSAIC"
      v-bind:item-name="$t(`writer.createMosaic`)"
    />
  </section>
</template>
