<script setup lang="ts">
import { ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import InputAreaComponent from "@/components/OnChainData/InputAreaComponent.vue";
import RelatedMosaicAreaComponent from "@/components/OnChainData/RelatedMosaicAreaComponent.vue";
import CreateMosaicAreaComponent from "@/components/MosaicInfo/CreateMosaicAreaComponent.vue";
import SSSLinkedSelectAreaComponent from "@/components/form/SSSLinkedSelectAreaComponent.vue";
import ModalConfirmComponent from "@/components/modal/ModalConfirmComponent.vue";
import { WriteMode } from "@/models/enums/WriteMode";
import CONSTS from "@/utils/consts";

// Stores
const writeMosaicStore = useWriteMosaicStore();
const writeOnChainDataStore = useWriteOnChainDataStore();

// Reactives
const mode = ref(WriteMode.CreateMosaic);
const isShownConfirmModal = ref(false);
const isConfirmed = ref<boolean | undefined>(undefined);

writeMosaicStore.ownerAddress = "";

/**
 * ページ離脱前の処理
 */
onBeforeRouteLeave(async (to) => {
  switch (to.name) {
    // 書き込み実施前に確認ダイアログを表示する
    case CONSTS.ROUTENAME_WRITER_CREATE_MOSAIC:
    case CONSTS.ROUTENAME_WRITER_WRITE_ONCHAIN_DATA:
      return await displayConfirmDialog();

    // 上記以外は処理不要のため、そのままページを離脱する
    default:
      return true;
  }
});

/**
 * 確認ダイアログの表示
 */
async function displayConfirmDialog(): Promise<boolean> {
  isConfirmed.value = undefined;
  isShownConfirmModal.value = true;
  return new Promise((resolve) => {
    const watchConfirmed = setInterval(() => {
      if (typeof isConfirmed.value !== "undefined") {
        clearInterval(watchConfirmed);
        resolve(isConfirmed.value);
      }
    }, 500);
  });
}

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
/**
 * 確認ダイアログ選択後のコールバック関数
 * @param confirmed 確認選択結果
 */
function onConfirmed(confirmed: boolean) {
  isConfirmed.value = confirmed;
}
</script>

<template>
  <article class="container animate__animated animate__fadeIn">
    <InputAreaComponent />
    <section class="my-2">
      <SSSLinkedSelectAreaComponent />
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
  <ModalConfirmComponent
    v-model:is-shown="isShownConfirmModal"
    v-bind:title="$t('writer.confirmTitle')"
    v-bind:items="[
      {
        key: $t('preview.title'),
        value:
          writeOnChainDataStore.title.length !== 0
            ? writeOnChainDataStore.title
            : CONSTS.STR_NOT_SETTING,
      },
      {
        key: $t('preview.message'),
        value:
          writeOnChainDataStore.message.length !== 0
            ? writeOnChainDataStore.message
            : CONSTS.STR_NOT_SETTING,
      },
      // TODO: 確認ダイアログに表示する項目の選定、モード別の表示切り分け
    ]"
    v-on:confirmed="onConfirmed"
  />
</template>
