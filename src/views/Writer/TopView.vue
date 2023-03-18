<script setup lang="ts">
import { useSSSStore } from "@/stores/sss";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import InputAreaComponent from "@/components/OnChainData/InputAreaComponent.vue";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
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
      <div class="row">
        <label class="col-md-3 col-form-label">
          {{ $t("mosaicInfo.supply") }}
        </label>
        <div class="col-md-9">
          <input
            v-model="writeMosaicStore.amount"
            type="number"
            class="form-control"
            min="1"
            placeholder="Input Supply Amount..."
          />
        </div>
      </div>
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
