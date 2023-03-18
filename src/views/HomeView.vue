<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import TransitionButtonComponent from "@/components/form/TransitionButtonComponent.vue";
import CONSTS from "@/utils/consts";

// Locale
const i18n = useI18n();

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
    <section class="row my-2 text-center text-danger">
      <h4 class="my-2">{{ $t(`home.bugInfo`) }}</h4>
      <p>{{ $t(`home.bugInfoDetail`) }}</p>
    </section>
    <section class="row my-2">
      <TransitionButtonComponent
        class="col-lg-2"
        v-bind:next-route-name="`WriterTop`"
        v-bind:item-name="$t(`writer.title`)"
      />
      <div class="col-lg-10">
        <p>{{ $t(`writer.explanation`) }}</p>
      </div>
    </section>
    <section class="row my-2">
      <TransitionButtonComponent
        class="col-lg-2"
        v-bind:next-route-name="`ViewerTop`"
        v-bind:item-name="$t(`viewer.title`)"
      />
      <div class="col-lg-10">
        <p>{{ $t(`viewer.explanation`) }}</p>
      </div>
    </section>
  </article>
</template>

<style scoped>
section {
  white-space: pre-wrap;
}
</style>
