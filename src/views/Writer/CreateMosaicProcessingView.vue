<script setup lang="ts">
import { ref, watch } from "vue";
import ProcessingComponent from "@/components/Progress/ProcessingComponent.vue";
import WriteCompleteComponent from "@/components/Progress/CreateMosaicCompleteComponent.vue";
import { useEnvironmentStore } from "@/stores/environment";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import { getWriteProgreassMessage } from "@/utils/converter";
import { WriteProgress } from "@/models/enums/WriteProgress";

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
</script>

<template>
  <WriteCompleteComponent
    v-if="writeMosaicStore.progress === WriteProgress.Complete"
  />
  <ProcessingComponent v-else v-bind:message="message" />
</template>
