<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import ProcessingComponent from "@/components/Progress/ProcessingComponent.vue";
import WriteCompleteComponent from "@/components/Progress/CreateMosaicCompleteComponent.vue";
import { useEnvironmentStore } from "@/stores/environment";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { WriteProgress } from "@/models/enums/WriteProgress";

// Locale
const i18n = useI18n();

// Stores
const envStore = useEnvironmentStore();
const writeMosaicStore = useWriteMosaicStore();

// Reactives
const message = ref("");

// Watch
watch(
  () => writeMosaicStore.progress,
  () => {
    const logTitle = "create mosaic progress watch:";
    envStore.logger.debug(logTitle, "start", writeMosaicStore.progress);
    message.value = getWriteProgreassMessage(writeMosaicStore.progress);
    envStore.logger.debug(logTitle, "end", message.value);
  },
  {
    immediate: true,
  }
);

// モザイク作成
writeMosaicStore.createMosaic();

/**
 * 書き込み状況に対応したメッセージを取得する
 * @param progress 書き込み状況
 * @returns 対応メッセージ
 */
function getWriteProgreassMessage(progress: WriteProgress): string {
  switch (progress) {
    case WriteProgress.Preprocess:
      return i18n.t("message.processing");
    case WriteProgress.LockSigning:
      return i18n.t("message.lockSigning");
    case WriteProgress.LockAnnounced:
      return i18n.t("message.lockAnnounced");
    case WriteProgress.LockUnconfirmed:
      return i18n.t("message.lockUnconfirmed");
    case WriteProgress.LockConfirmed:
      return i18n.t("message.lockConfirmed");
    case WriteProgress.TxSigning:
      return i18n.t("message.txSigning");
    case WriteProgress.TxAnnounced:
      return i18n.t("message.txAnnounced");
    case WriteProgress.TxWaitCosign:
      return i18n.t("message.txWaitCosign");
    case WriteProgress.TxUnconfirmed:
      return i18n.t("message.txUnconfirmed");
    case WriteProgress.TxConfirmed:
      return i18n.t("message.txConfirmed");
    case WriteProgress.Complete:
      return i18n.t("message.complete");
    case WriteProgress.Failed:
      return i18n.t("message.failed");
    case WriteProgress.Standby:
    default:
      return i18n.t("message.prepare");
  }
}
</script>

<template>
  <WriteCompleteComponent
    v-if="writeMosaicStore.progress === WriteProgress.Complete"
  />
  <ProcessingComponent v-else v-bind:message="message" />
</template>
