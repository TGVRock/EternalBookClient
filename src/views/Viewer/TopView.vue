<script setup lang="ts">
import { ref, computed } from "vue";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();
const mosaicId = ref("");
const linkMosaicId = computed((): string => {
  return "" !== mosaicId.value ? mosaicId.value : "NA";
});
</script>

<template>
  <section class="container" id="inputArea">
    <input type="text" v-model="mosaicId" placeholder="Input Mosaic ID..." />
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
