<script setup lang="ts">
import { computed } from "vue";
import ProcessingComponent from "@/components/ProcessingComponent.vue";
import WriteOnChainCompleteComponent from "@/components/WriteOnChainCompleteComponent.vue";
import { TransactionGroup } from "symbol-sdk";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import CONSTS from "@/utils/consts";

const writeOnChainDataStore = useWriteOnChainDataStore();

const entire = Math.ceil(
  writeOnChainDataStore.dataBase64.length /
    (CONSTS.TX_DATASIZE_PER_TRANSFER * CONSTS.TX_DATA_TX_NUM)
);

const proceed = computed(() => {
  return Math.ceil(
    writeOnChainDataStore.processedSize /
      writeOnChainDataStore.dataBase64.length
  );
});

writeOnChainDataStore.writeOnChain();
</script>

<template>
  <ProcessingComponent
    v-if="writeOnChainDataStore.state === TransactionGroup.Unconfirmed"
    v-bind:message="
      $t('message.processingOnChain', { proceed: proceed, entire: entire })
    "
  />
  <WriteOnChainCompleteComponent
    v-else-if="writeOnChainDataStore.state === TransactionGroup.Confirmed"
  />
  <ProcessingComponent v-else v-bind:message="$t('message.prepare')" />
</template>
