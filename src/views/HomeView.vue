<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import TopLinkAreaComponent from "@/components/home/TopLinkAreaComponent.vue";
import CONSTS from "@/utils/consts";
import { useEnvironmentStore } from "@/stores/environment";

// Locale
const i18n = useI18n();

// Stores
const envStore = useEnvironmentStore();

// Reactives
const messageList = ref<Array<string>>([]);

// Watch
watch(
  i18n.locale,
  () => {
    messageList.value = [];
    let idx = 0;
    while (
      i18n.t("home.explanationList[" + idx + "]", CONSTS.STR_NA) !==
      CONSTS.STR_NA
    ) {
      messageList.value.push(i18n.t("home.explanationList[" + idx + "]"));
      idx++;
    }
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <article class="container">
    <h2 class="my-4 text-center">{{ $t(`home.title`) }}</h2>
    <section class="row my-2">
      <p>{{ $t(`home.explanation`) }}</p>
      <ul class="ms-4">
        <li v-for="(message, idx) in messageList" v-bind:key="idx">
          {{ message }}
        </li>
      </ul>
    </section>
    <section
      class="row my-2 text-center text-danger"
      v-if="!envStore.isAvailable"
    >
      <h4 class="my-2">{{ $t(`home.bugInfo`) }}</h4>
      <p>{{ $t(`home.bugInfoDetail`) }}</p>
    </section>
    <TopLinkAreaComponent
      v-if="envStore.isAvailable"
      v-bind:next-route-name="`WriterTop`"
      v-bind:function-name="`writer`"
    />
    <TopLinkAreaComponent
      v-if="envStore.isAvailable"
      v-bind:next-route-name="`ViewerTop`"
      v-bind:function-name="`viewer`"
    />
  </article>
</template>

<style scoped>
section {
  white-space: pre-wrap;
}
</style>
