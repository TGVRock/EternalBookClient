<script setup lang="ts">
import { ref, computed, watch } from "vue";
import ProcessingComponent from "@/components/Progress/ProcessingComponent.vue";
import WriteOnChainCompleteComponent from "@/components/Progress/WriteOnChainCompleteComponent.vue";
import { useEnvironmentStore } from "@/stores/environment";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import CONSTS from "@/utils/consts";
import { getWriteProgreassMessage } from "@/utils/converter";
import { WriteProgress } from "@/models/enums/WriteProgress";

// Stores
const envStore = useEnvironmentStore();
const writeOnChainDataStore = useWriteOnChainDataStore();

// Reactives
const message = ref("");

// Watch
watch(
  () => writeOnChainDataStore.progress,
  () => {
    const logTitle = "write data progress watch:";
    envStore.logger.debug(logTitle, "start", writeOnChainDataStore.progress);
    const entire = Math.ceil(
      writeOnChainDataStore.dataBase64.length /
        (CONSTS.TX_DATASIZE_PER_TRANSFER * CONSTS.TX_DATA_TX_NUM)
    );
    const proceed = Math.ceil(
      writeOnChainDataStore.processedSize /
        writeOnChainDataStore.dataBase64.length
    );
    const dataProgress = proceed.toString() + " / " + entire.toString() + " ";
    if (
      writeOnChainDataStore.progress === WriteProgress.Standby ||
      writeOnChainDataStore.progress === WriteProgress.Failed ||
      writeOnChainDataStore.progress === WriteProgress.Complete
    ) {
      message.value = getWriteProgreassMessage(writeOnChainDataStore.progress);
    } else {
      message.value =
        dataProgress + getWriteProgreassMessage(writeOnChainDataStore.progress);
    }
    envStore.logger.debug(logTitle, "end", message.value);
  },
  {
    immediate: true,
  }
);

// オンチェーンデータ書き込み
writeOnChainDataStore.writeOnChain();
</script>

<template>
  <WriteOnChainCompleteComponent
    v-if="writeOnChainDataStore.progress === WriteProgress.Complete"
  />
  <ProcessingComponent v-else v-bind:message="message" />
</template>
