<script setup lang="ts">
import { useSSSStore } from "@/stores/sss";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import InputAreaComponent from "@/components/OnChainData/InputAreaComponent.vue";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
import NumberAreaComponent from "@/components/form/NumberAreaComponent.vue";
import MosaicFlagAreaComponent from "@/components/form/MosaicFlagAreaComponent.vue";
import SSSLinkedSelectAreaComponent from "@/components/form/SSSLinkedSelectAreaComponent.vue";
import TransitionButtonComponent from "@/components/form/TransitionButtonComponent.vue";

// Stores
const sssStore = useSSSStore();
const writeMosaicStore = useWriteMosaicStore();
const writeOnChainDataStore = useWriteOnChainDataStore();

writeMosaicStore.ownerAddress = "";
</script>

<template>
  <article class="container">
    <section>
      <SSSLinkedSelectAreaComponent v-if="sssStore.sssLinked" />
      <TextAreaComponent
        v-else
        v-bind:item-name="$t('mosaicInfo.address')"
        v-bind:placeholder="
          $t('writer.pleaseInputItem', { item: $t('mosaicInfo.address') })
        "
        v-model:value="writeMosaicStore.ownerAddress"
      />
    </section>
    <InputAreaComponent />
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
        v-bind:next-route-name="`CreateMosaic`"
        v-bind:item-name="$t(`writer.createMosaic`)"
      />
    </section>
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
  </article>
</template>
