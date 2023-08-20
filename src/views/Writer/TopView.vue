<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { onBeforeRouteLeave } from "vue-router";
import { useSettingsStore } from "@/stores/settings";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import InputAreaComponent from "@/components/OnChainData/InputAreaComponent.vue";
import RelatedMosaicAreaComponent from "@/components/OnChainData/RelatedMosaicAreaComponent.vue";
import CreateMosaicAreaComponent from "@/components/MosaicInfo/CreateMosaicAreaComponent.vue";
import SSSLinkedSelectAreaComponent from "@/components/form/SSSLinkedSelectAreaComponent.vue";
import ModalConfirmComponent from "@/components/modal/ModalConfirmComponent.vue";
import ModalInfoComponent from "@/components/modal/ModalInfoComponent.vue";
import { WriteMode } from "@/models/enums/WriteMode";
import CONSTS from "@/utils/consts";
import { getHash } from "@/utils/crypto";

// Locale
const i18n = useI18n();

// Stores
const settingsStore = useSettingsStore();
const writeMosaicStore = useWriteMosaicStore();
const writeOnChainDataStore = useWriteOnChainDataStore();

// Reactives
const mode = ref(WriteMode.CreateMosaic);
const isShownConfirmModal = ref(false);
const isConfirmed = ref<boolean | undefined>(undefined);
const confirmItems = ref<Array<{ key: string; value: string }>>([]);
const isShownInfoModal = ref(false);

writeMosaicStore.ownerAddress = "";

/**
 * 表示時処理
 */
onMounted(() => {
  if (localStorage.getItem(CONSTS.STORAGEKEY_DATA_HASH) !== null) {
    // 前回中断データが存在することを通知するメッセージを表示する
    settingsStore.logger.debug("localStorage");
    isShownInfoModal.value = true;
    // TODO: [リトライ対応] 書き込み途中のページ移動を抑制する必要あり
  }
});

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
  confirmItems.value = [];
  confirmItems.value.push({
    key: i18n.t("preview.title"),
    value:
      writeOnChainDataStore.title.length !== 0
        ? writeOnChainDataStore.title
        : CONSTS.STR_NOT_SETTING,
  });
  confirmItems.value.push({
    key: i18n.t("preview.message"),
    value:
      writeOnChainDataStore.message.length !== 0
        ? writeOnChainDataStore.message
        : CONSTS.STR_NOT_SETTING,
  });
  confirmItems.value.push({
    key: i18n.t("mosaicInfo.address"),
    value: writeMosaicStore.ownerAddress,
  });
  confirmItems.value.push({
    key: i18n.t("writer.writeMode"),
    value:
      mode.value === WriteMode.CreateMosaic
        ? i18n.t("writer.modeCreate")
        : i18n.t("writer.modeRelated"),
  });
  if (mode.value === WriteMode.CreateMosaic) {
    confirmItems.value.push({
      key: i18n.t("writer.mosaicFlags"),
      value:
        (writeMosaicStore.mosaicFlags.supplyMutable
          ? i18n.t("mosaicInfo.supplyMutable")
          : i18n.t("mosaicInfo.supplyImmutable")) +
        ", " +
        (writeMosaicStore.mosaicFlags.transferable
          ? i18n.t("mosaicInfo.transferable")
          : i18n.t("mosaicInfo.nonTransferable")) +
        ", " +
        (writeMosaicStore.mosaicFlags.restrictable
          ? i18n.t("mosaicInfo.restrictable")
          : i18n.t("mosaicInfo.nonRestrictable")) +
        ", " +
        (writeMosaicStore.mosaicFlags.revokable
          ? i18n.t("mosaicInfo.revokable")
          : i18n.t("mosaicInfo.nonRevokable")),
    });
    confirmItems.value.push({
      key: i18n.t("mosaicInfo.supply"),
      value: writeMosaicStore.amount.toString(),
    });
  } else if (mode.value === WriteMode.RelatedMosaic) {
    confirmItems.value.push({
      key: i18n.t("mosaicInfo.id"),
      value: writeOnChainDataStore.relatedMosaicIdStr,
    });
  }

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
function onConfirmed(confirmed?: boolean): void {
  isConfirmed.value = confirmed;
}

// Watch
watch(
  () => writeOnChainDataStore.dataBase64,
  (): void => {
    // LocalStorage に保存されている前回情報を取得
    const prevDataHash = localStorage.getItem(CONSTS.STORAGEKEY_DATA_HASH);
    const targetMosaicId = localStorage.getItem(
      CONSTS.STORAGEKEY_TARGET_MOSAIC_ID
    );
    if (targetMosaicId === null || prevDataHash === null) {
      return;
    }

    // 前回と同じデータか確認
    const dataHash = getHash(writeOnChainDataStore.dataBase64);
    if (typeof dataHash === "undefined" || dataHash !== prevDataHash) {
      return;
    }

    // 前回と同じモザイクを設定する
    mode.value = WriteMode.RelatedMosaic;
    writeOnChainDataStore.relatedMosaicIdStr = targetMosaicId;
  },
  {
    immediate: true,
  }
);
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
    v-bind:items="confirmItems"
    v-on:confirmed="onConfirmed"
  />
  <ModalInfoComponent
    v-model:is-shown="isShownInfoModal"
    v-bind:title="$t('writer.infoContinueTitle')"
    v-bind:message="$t('writer.infoContinueMessage')"
  />
</template>
