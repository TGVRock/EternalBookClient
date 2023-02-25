<script setup lang="ts">
import { isImage, isAudio, isHtml, isMovie } from "@/utils/mime";

defineProps<{
  base64: string;
  mime: string;
}>();
</script>

<template>
  <img
    v-if="isImage(mime)"
    class="img-fluid w-100 border border-4 rounded-2 border-light"
    v-bind:src="base64"
    alt="On Chain Data"
  />
  <audio
    v-else-if="isAudio(mime)"
    v-bind:src="base64"
    controls="true"
    autoplay="true"
    loop="true"
  ></audio>
  <iframe
    v-else-if="isHtml(mime)"
    v-bind:src="base64"
    sandbox="allow-scripts allow-popups"
  ></iframe>
  <video
    v-else-if="isMovie(mime)"
    v-bind:src="base64"
    v-bind:type="mime"
    class="w-100"
    controls="true"
  ></video>
  <img
    v-else
    class="img-fluid w-100 border border-4 rounded-2 border-light"
    src="@/assets/nodata.png"
    alt="No Data"
  />
</template>
