<script setup lang="ts">
import WritePrepareComponent from "@/components/WritePrepareComponent.vue";
import WriteProcessingComponent from "@/components/WriteProcessingComponent.vue";
import WriteCompleteComponent from "@/components/WriteCompleteComponent.vue";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { TransactionGroup } from "symbol-sdk";

const writeMosaicStore = useWriteMosaicStore();
writeMosaicStore.createMosaic();
</script>

<template>
  <WriteProcessingComponent
    v-if="writeMosaicStore.state === TransactionGroup.Unconfirmed"
  />
  <WriteCompleteComponent
    v-else-if="writeMosaicStore.state === TransactionGroup.Confirmed"
  />
  <WritePrepareComponent v-else />
</template>
