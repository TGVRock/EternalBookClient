<script setup lang="ts">
import ProcessingComponent from "@/components/ProcessingComponent.vue";
import WriteCompleteComponent from "@/components/WriteCompleteComponent.vue";
import { TransactionGroup } from "symbol-sdk";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";

const writeOnChainDataStore = useWriteOnChainDataStore();
writeOnChainDataStore.writeOnChain();
</script>

<template>
  <ProcessingComponent
    v-if="writeOnChainDataStore.state === TransactionGroup.Unconfirmed"
    v-bind:message="$t('message.processing')"
  />
  <WriteCompleteComponent
    v-else-if="writeOnChainDataStore.state === TransactionGroup.Confirmed"
  />
  <ProcessingComponent v-else v-bind:message="$t('message.prepare')" />
</template>
