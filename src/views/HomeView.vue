<script setup lang="ts">
import { ref, watch, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import TopLinkAreaComponent from "@/components/home/TopLinkAreaComponent.vue";
import CONSTS from "@/utils/consts";
import { useSettingsStore } from "@/stores/settings";

// Locale
const i18n = useI18n();

// Stores
const settingsStore = useSettingsStore();
// Route
const route = useRoute();
// Router
const router = useRouter();

// Reactives
const messageList = ref<Array<string>>([]);

// データ表示ページへ直接遷移する
onBeforeMount(() => {
  if (
    typeof route.query.netType !== "undefined" &&
    typeof route.query.mosaicId !== "undefined"
  ) {
    router.push({
      name: CONSTS.ROUTENAME_VIEWER_RESULT,
      params: {
        netType: route.query.netType?.toString(),
        mosaicId: route.query.mosaicId?.toString(),
      },
    });
  }
});

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
  <article class="container animate__animated animate__fadeIn">
    <section class="row my-4 justify-content-center">
      <img class="col-lg-9" src="/logo.svg" v-bind:alt="$t(`home.title`)" />
    </section>
    <section class="my-2">
      <p>{{ $t(`home.explanation`) }}</p>
      <ul>
        <li v-for="(message, idx) in messageList" v-bind:key="idx">
          {{ message }}
        </li>
      </ul>
    </section>
    <section
      class="row my-2 text-center text-danger"
      v-if="!settingsStore.isAvailable"
    >
      <h4 class="my-2">
        {{
          $t(`home.info`, {
            kind: $t("home." + settingsStore.unavailableReason + ".kind"),
          })
        }}
      </h4>
      <p>
        {{
          $t(`home.infoDetail`, {
            cause: $t("home." + settingsStore.unavailableReason + ".cause"),
            until: $t("home." + settingsStore.unavailableReason + ".until"),
          })
        }}
      </p>
    </section>
    <TopLinkAreaComponent
      v-if="settingsStore.isAvailable"
      v-bind:next-route-name="CONSTS.ROUTENAME_SETTINGS"
      v-bind:function-name="`settings`"
    />
    <TopLinkAreaComponent
      v-if="settingsStore.isAvailable"
      v-bind:next-route-name="CONSTS.ROUTENAME_WRITER_TOP"
      v-bind:function-name="`writer`"
      v-bind:exist-annotation="settingsStore.addressStr.length === 0"
      v-bind:is-disabled="settingsStore.addressStr.length === 0"
    />
    <TopLinkAreaComponent
      v-if="settingsStore.isAvailable"
      v-bind:next-route-name="CONSTS.ROUTENAME_VIEWER_TOP"
      v-bind:function-name="`viewer`"
    />
  </article>
</template>

<style scoped>
section {
  white-space: pre-wrap;
}
</style>
