<script setup lang="ts">
import { useEnvironmentStore } from "@/stores/environment";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import { getMimeFromBase64 } from "@/utils/mime";
import PreviewDataComponent from "@/components/OnChainData/PreviewDataComponent.vue";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
import FileSelectComponent from "@/components/form/FileSelectButtonComponent.vue";
import MosaicFlagAreaComponent from "@/components/form/MosaicFlagAreaComponent.vue";
import SSSLinkedSelectAreaComponent from "@/components/form/SSSLinkedSelectAreaComponent.vue";
import TextareaAreaComponent from "@/components/form/TextareaAreaComponent.vue";
import TransitionButtonComponent from "@/components/form/TransitionButtonComponent.vue";

const envStore = useEnvironmentStore();
const writeMosaicStore = useWriteMosaicStore();
const writeOnChainDataStore = useWriteOnChainDataStore();

// FIXME: 手数料乗数を選択可能にする(NetworkHttp.getTransactionFees())

writeMosaicStore.linkedAddress = "";
writeMosaicStore.ownerAddress = "";
</script>

<template>
  <article class="container">
    <section>
      <SSSLinkedSelectAreaComponent v-if="envStore.sssLinked" />
      <TextAreaComponent
        v-else
        v-bind:item-name="$t('mosaicInfo.address')"
        v-bind:placeholder="
          $t('writer.pleaseInputItem', { item: $t('mosaicInfo.address') })
        "
        v-model:value="writeMosaicStore.ownerAddress"
      />

      <FileSelectComponent v-model:base64="writeOnChainDataStore.dataBase64" />
      <PreviewDataComponent
        v-bind:base64="writeOnChainDataStore.dataBase64"
        v-bind:mime="getMimeFromBase64(writeOnChainDataStore.dataBase64)"
      />
      <TextAreaComponent
        v-bind:item-name="$t('preview.title')"
        v-bind:placeholder="
          $t('writer.pleaseInputItem', { item: $t('preview.title') })
        "
        v-model:value="writeOnChainDataStore.title"
      />
      <TextareaAreaComponent
        v-bind:item-name="$t('preview.message')"
        v-bind:placeholder="
          $t('writer.pleaseInputItem', { item: $t('preview.message') })
        "
        v-bind:rows="5"
        v-model:value="writeOnChainDataStore.message"
      />
    </section>
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
        v-bind:next-route-name="`WriteOnChainData`"
        v-bind:item-name="$t(`writer.writeOnChain`)"
      />
    </section>
  </article>
</template>
