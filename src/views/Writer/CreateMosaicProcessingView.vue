<script setup lang="ts">
import ProcessingComponent from "@/components/Progress/ProcessingComponent.vue";
import WriteCompleteComponent from "@/components/Progress/CreateMosaicCompleteComponent.vue";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { TransactionGroup } from "symbol-sdk";

const writeMosaicStore = useWriteMosaicStore();
writeMosaicStore.createMosaic();
</script>

<template>
  <ProcessingComponent
    v-if="writeMosaicStore.state === TransactionGroup.Unconfirmed"
    v-bind:message="$t('message.processing')"
  />
  <WriteCompleteComponent
    v-else-if="writeMosaicStore.state === TransactionGroup.Confirmed"
  />
  <ProcessingComponent v-else v-bind:message="$t('message.prepare')" />
</template>
