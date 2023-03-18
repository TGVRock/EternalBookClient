<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import ProcessingComponent from "@/components/Progress/ProcessingComponent.vue";
import WriteOnChainCompleteComponent from "@/components/Progress/WriteOnChainCompleteComponent.vue";
import { useEnvironmentStore } from "@/stores/environment";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import CONSTS from "@/utils/consts";
import { WriteProgress } from "@/models/enums/WriteProgress";

// Locale
const i18n = useI18n();

// Stores
const envStore = useEnvironmentStore();
const writeOnChainDataStore = useWriteOnChainDataStore();

// Reactives
const message = ref("");

// Watch
watch(
  [() => writeOnChainDataStore.progress, i18n.locale],
  () => {
    const logTitle = "write data progress watch:";
    envStore.logger.debug(logTitle, "start", writeOnChainDataStore.progress);
    message.value = getWriteProgreassMessage(writeOnChainDataStore.progress);
    envStore.logger.debug(logTitle, "end", message.value);
  },
  {
    immediate: true,
  }
);

// オンチェーンデータ書き込み
writeOnChainDataStore.writeOnChain();

/**
 * 書き込み状況に対応したメッセージを取得する
 * @param progress 書き込み状況
 * @returns 対応メッセージ
 */
function getWriteProgreassMessage(progress: WriteProgress): string {
  const entire = Math.ceil(
    writeOnChainDataStore.dataBase64.length /
      (CONSTS.TX_DATASIZE_PER_TRANSFER * CONSTS.TX_DATA_TX_NUM)
  );
  const proceed = Math.ceil(
    writeOnChainDataStore.processedSize /
      (CONSTS.TX_DATASIZE_PER_TRANSFER * CONSTS.TX_DATA_TX_NUM)
  );
  const dataProgress = proceed.toString() + " / " + entire.toString() + " ";
  switch (progress) {
    case WriteProgress.Preprocess:
      return dataProgress + i18n.t("message.processing");
    case WriteProgress.LockSigning:
      return dataProgress + i18n.t("message.lockSigning");
    case WriteProgress.LockAnnounced:
      return dataProgress + i18n.t("message.lockAnnounced");
    case WriteProgress.LockUnconfirmed:
      return dataProgress + i18n.t("message.lockUnconfirmed");
    case WriteProgress.LockConfirmed:
      return dataProgress + i18n.t("message.lockConfirmed");
    case WriteProgress.TxSigning:
      return dataProgress + i18n.t("message.txSigning");
    case WriteProgress.TxAnnounced:
      return dataProgress + i18n.t("message.txAnnounced");
    case WriteProgress.TxWaitCosign:
      return dataProgress + i18n.t("message.txWaitCosign");
    case WriteProgress.TxUnconfirmed:
      return dataProgress + i18n.t("message.txUnconfirmed");
    case WriteProgress.TxConfirmed:
      return dataProgress + i18n.t("message.txConfirmed");
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
  <WriteOnChainCompleteComponent
    v-if="writeOnChainDataStore.progress === WriteProgress.Complete"
  />
  <ProcessingComponent v-else v-bind:message="message" />
</template>
