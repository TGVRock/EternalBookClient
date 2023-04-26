<script setup lang="ts">
import { ref, watch } from "vue";
import { isHtml, getChainDataType, getMimeFromDataUrl } from "@/utils/mime";
import { ChainDataType } from "@/models/enums/ChainDataType";

// Props
const props = defineProps<{
  /** Base64データ */
  base64: string;
}>();

// Reactives
const mime = ref("");
const dataUri = ref("");
const dataType = ref(ChainDataType.Unavailable);

// Watch
watch(
  () => props.base64,
  () => {
    getMimeFromDataUrl(props.base64)
      .then((value) => {
        mime.value = value;
        dataUri.value = props.base64;
        dataType.value = getChainDataType(value);
      })
      .catch(() => {
        mime.value = "";
        dataUri.value = "";
        dataType.value = ChainDataType.Unavailable;
      });
  },
  { immediate: true }
);
</script>

<template>
  <img
    v-if="dataType === ChainDataType.Image"
    class="img-fluid w-100 border border-4 rounded-2 border-light"
    v-bind:src="dataUri"
    alt="On Chain Data"
  />
  <audio
    v-else-if="dataType === ChainDataType.Audio"
    v-bind:src="dataUri"
    controls="true"
    autoplay="true"
    loop="true"
  ></audio>
  <iframe
    v-else-if="isHtml(mime)"
    v-bind:src="dataUri"
    sandbox="allow-scripts allow-popups"
  ></iframe>
  <video
    v-else-if="dataType === ChainDataType.Movie"
    v-bind:src="dataUri"
    v-bind:type="mime"
    controls="true"
  ></video>
  <model-viewer
    v-else-if="dataType === ChainDataType.Model"
    v-bind:src="dataUri"
    class="w-100"
    camera-controls
    autoplay
  ></model-viewer>
  <img
    v-else
    class="img-fluid w-100 border border-4 rounded-2 border-light"
    src="@/assets/nodata.png"
    alt="No Data"
  />
</template>

<style scoped>
model-viewer {
  height: 50vh;
  width: 100%;
}
</style>
