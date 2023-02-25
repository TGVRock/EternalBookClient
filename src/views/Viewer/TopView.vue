<script setup lang="ts">
import { ref, computed } from "vue";
import { useEnvironmentStore } from "@/stores/environment";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";

const environmentStore = useEnvironmentStore();
const mosaicId = ref("");
const linkMosaicId = computed((): string => {
  return "" !== mosaicId.value ? mosaicId.value : "NA";
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
    <RouterLink
      v-bind:to="{
        name: 'ViewerResult',
        params: {
          netType: environmentStore.networkType,
          mosaicId: linkMosaicId,
        },
      }"
    >
      <button>Get Mosaic Data</button>
    </RouterLink>
  </section>
</template>
