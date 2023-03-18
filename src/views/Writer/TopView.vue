<script setup lang="ts">
import { useSSSStore } from "@/stores/sss";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import InputAreaComponent from "@/components/OnChainData/InputAreaComponent.vue";
import RelatedMosaicAreaComponent from "@/components/OnChainData/RelatedMosaicAreaComponent.vue";
import CreateMosaicAreaComponent from "@/components/MosaicInfo/CreateMosaicAreaComponent.vue";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
import SSSLinkedSelectAreaComponent from "@/components/form/SSSLinkedSelectAreaComponent.vue";

// Stores
const sssStore = useSSSStore();
const writeMosaicStore = useWriteMosaicStore();

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
    <CreateMosaicAreaComponent />
    <RelatedMosaicAreaComponent />
  </article>
</template>
