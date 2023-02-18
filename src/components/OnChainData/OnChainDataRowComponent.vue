<script setup lang="ts">
import type { OnChainData } from "@/models/OnChainDataModel";
import { isImage, isAudio } from "@/utils/mime";

defineProps<{
  data: OnChainData;
}>();
</script>

<template>
  <div class="row">
    <div class="col-lg-6 align-self-center text-center">
      <img
        v-if="isImage(data.mime)"
        class="img-fluid w-100 border border-4 rounded-2 border-light"
        v-bind:src="data.base64"
        alt="On Chain Data"
      />
      <audio
        v-else-if="isAudio(data.mime)"
        v-bind:src="data.base64"
        controls="true"
        autoplay="true"
        loop="true"
      ></audio>
      <img
        v-else
        class="img-fluid w-100 border border-4 rounded-2 border-light"
        src="@/assets/nodata.png"
        alt="No Data"
      />
    </div>
    <div class="col-lg-6 align-self-center">
      <h6 class="text-muted">{{ data.date }}</h6>
      <h3>{{ data.title }}</h3>
      <p>{{ data.description }}</p>
    </div>
  </div>
</template>
