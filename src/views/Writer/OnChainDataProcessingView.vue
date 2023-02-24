<script setup lang="ts">
import WritePrepareComponent from "@/components/WritePrepareComponent.vue";
import WriteProcessingComponent from "@/components/WriteProcessingComponent.vue";
import WriteCompleteComponent from "@/components/WriteCompleteComponent.vue";
import { TransactionGroup } from "symbol-sdk";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";

const writeOnChainDataStore = useWriteOnChainDataStore();
writeOnChainDataStore.writeOnChain();
</script>

<template>
  <WriteProcessingComponent
    v-if="writeOnChainDataStore.state === TransactionGroup.Unconfirmed"
  />
  <WriteCompleteComponent
    v-else-if="writeOnChainDataStore.state === TransactionGroup.Confirmed"
  />
  <WritePrepareComponent v-else />
</template>
