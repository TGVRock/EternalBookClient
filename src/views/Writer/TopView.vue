<script setup lang="ts">
import { ref } from "vue";
import { useSSSStore } from "@/stores/sss";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import InputAreaComponent from "@/components/OnChainData/InputAreaComponent.vue";
import RelatedMosaicAreaComponent from "@/components/OnChainData/RelatedMosaicAreaComponent.vue";
import CreateMosaicAreaComponent from "@/components/MosaicInfo/CreateMosaicAreaComponent.vue";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
import SSSLinkedSelectAreaComponent from "@/components/form/SSSLinkedSelectAreaComponent.vue";
import { WriteMode } from "@/models/enums/WriteMode";

// Stores
const sssStore = useSSSStore();
const writeMosaicStore = useWriteMosaicStore();

// Reactives
const mode = ref(WriteMode.CreateMosaic);

writeMosaicStore.ownerAddress = "";

/**
 * モザイク作成モードクリック
 */
function onClickCreateMode() {
  mode.value = WriteMode.CreateMosaic;
}
/**
 * 既存モザイクへの関連付けモードクリック
 */
function onClickRelateMode() {
  mode.value = WriteMode.RelatedMosaic;
}
</script>

<template>
  <article class="container animate__animated animate__fadeIn">
    <InputAreaComponent />
    <section class="my-2">
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
    <section class="row my-2">
      <div class="col-lg-3 d-lg-grid gap-lg-2 mt-2 mb-auto">
        <div
          class="col-6 col-lg-12 btn text-lg-start"
          v-bind:class="{ 'btn-success': mode === WriteMode.CreateMosaic }"
          v-on:click="onClickCreateMode"
        >
          {{ $t("writer.modeCreate") }}
        </div>
        <div
          class="col-6 col-lg-12 btn text-lg-start"
          v-bind:class="{ 'btn-success': mode === WriteMode.RelatedMosaic }"
          v-on:click="onClickRelateMode"
        >
          {{ $t("writer.modeRelated") }}
        </div>
      </div>
      <div class="col-lg-9 tab-content">
        <CreateMosaicAreaComponent
          class="animate__animated animate__fadeIn"
          v-if="mode === WriteMode.CreateMosaic"
        />
        <RelatedMosaicAreaComponent
          class="animate__animated animate__fadeIn"
          v-if="mode === WriteMode.RelatedMosaic"
        />
      </div>
    </section>
  </article>
</template>
