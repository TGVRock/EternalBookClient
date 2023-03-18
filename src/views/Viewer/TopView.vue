<script setup lang="ts">
import { ref, computed } from "vue";
import { useEnvironmentStore } from "@/stores/environment";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
import TransitionButtonComponent from "@/components/form/TransitionButtonComponent.vue";
import CONSTS from "@/utils/consts";

const envStore = useEnvironmentStore();
const mosaicId = ref("");
const linkMosaicId = computed((): string => {
  return "" !== mosaicId.value ? mosaicId.value : CONSTS.STR_NA;
});
</script>

<template>
  <section class="container" id="inputArea">
    <TextAreaComponent
      v-bind:item-name="$t('mosaicInfo.id')"
      v-bind:placeholder="
        $t('writer.pleaseInputItem', { item: $t('mosaicInfo.id') })
      "
      v-model:value="mosaicId"
    />
    <TransitionButtonComponent
      class="text-center"
      v-bind:next-route-name="`ViewerResult`"
      v-bind:item-name="$t(`viewer.readData`)"
      v-bind:params="{
        netType: envStore.networkType,
        mosaicId: linkMosaicId,
      }"
    />
  </section>
</template>
