<script setup lang="ts">
import type { OnChainData } from "@/models/OnChainDataModel";
import DataAreaComponent from "./DataAreaComponent.vue";

defineProps<{
  data: OnChainData;
}>();
</script>

<template>
  <div class="row">
    <div class="col-lg-6 align-self-center text-center">
      <DataAreaComponent v-bind:base64="data.base64" v-bind:mime="data.mime" />
    </div>
    <div class="col-lg-6 align-self-center">
      <h6 class="text-muted">{{ data.date }}</h6>
      <h3>{{ data.title }}</h3>
      <p>{{ data.description }}</p>
    </div>
  </div>
</template>
