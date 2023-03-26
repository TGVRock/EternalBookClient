<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useChainStore } from "@/stores/chain";
import { useAccountStore } from "@/stores/account";
import CreatedMosaicAreaComponent from "@/components/viewer/CreatedMosaicAreaComponent.vue";
import OwnedMosaicAreaComponent from "@/components/viewer/OwnedMosaicAreaComponent.vue";
import NetworkTypeAreaComponent from "@/components/viewer/NetworkTypeAreaComponent.vue";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
import ModalComponent from "@/components/common/ModalComponent.vue";
import { ReadMode } from "@/models/enums/ReadMode";
import { isValidMosaicId } from "@/apis/mosaic";

// Stores
const chainStore = useChainStore();
const accountStore = useAccountStore();
// Router
const router = useRouter();

// Reactives
const netType = ref(chainStore.networkType);
const mode = ref(ReadMode.ArbitraryMosaic);
const mosaicId = ref("");
const isShownErrorModal = ref(false);
const errorCause = ref("mosaicIdInvalid");

/**
 * 作成モザイクモードクリック
 */
function onClickCreatedMode() {
  mode.value = ReadMode.CreatedMosaic;
}
/**
 * 所有モザイクモードクリック
 */
function onClickOwendMode() {
  mode.value = ReadMode.OwendMosaic;
}
/**
 * 任意モザイクモードクリック
 */
function onClickArbitraryMode() {
  mode.value = ReadMode.ArbitraryMosaic;
}
/**
 * データ読み込みボタンクリック
 */
function onClickViewerResult() {
  if (!isValidMosaicId(mosaicId.value)) {
    isShownErrorModal.value = true;
    errorCause.value = "mosaicIdInvalid";
    return;
  }
  router.push({
    name: "ViewerResult",
    params: {
      netType: netType.value,
      mosaicId: mosaicId.value,
    },
  });
}
</script>

<template>
  <section class="container animate__animated animate__fadeIn">
    <section class="row my-2">
      <div class="col-lg-3 d-lg-grid gap-lg-2 mt-2 mb-auto">
        <div
          class="col-4 col-lg-12 btn text-lg-start"
          v-bind:class="{
            'btn-success': mode === ReadMode.CreatedMosaic,
            disabled: accountStore.createdMosaics.length === 0,
          }"
          v-on:click="onClickCreatedMode"
        >
          {{ $t("viewer.modeCreated") }}
        </div>
        <div
          class="col-4 col-lg-12 btn text-lg-start"
          v-bind:class="{
            'btn-success': mode === ReadMode.OwendMosaic,
            disabled: accountStore.owendMosaics.length === 0,
          }"
          v-on:click="onClickOwendMode"
        >
          {{ $t("viewer.modeOwned") }}
        </div>
        <div
          class="col-4 col-lg-12 btn text-lg-start"
          v-bind:class="{ 'btn-success': mode === ReadMode.ArbitraryMosaic }"
          v-on:click="onClickArbitraryMode"
        >
          {{ $t("viewer.modeArbitrary") }}
        </div>
      </div>
      <div class="col-lg-9 tab-content">
        <!-- 作成モザイク -->
        <CreatedMosaicAreaComponent
          class="animate__animated animate__fadeIn"
          v-if="mode === ReadMode.CreatedMosaic"
          v-model:value="mosaicId"
        />
        <!-- 所有モザイク -->
        <OwnedMosaicAreaComponent
          class="animate__animated animate__fadeIn"
          v-if="mode === ReadMode.OwendMosaic"
          v-model:value="mosaicId"
        />
        <NetworkTypeAreaComponent
          class="animate__animated animate__fadeIn"
          v-if="mode === ReadMode.ArbitraryMosaic"
          v-model:value="netType"
        />
        <TextAreaComponent
          class="animate__animated animate__fadeIn"
          v-if="mode === ReadMode.ArbitraryMosaic"
          v-bind:item-name="$t('mosaicInfo.id')"
          v-bind:placeholder="
            $t('writer.pleaseInputItem', { item: $t('mosaicInfo.id') })
          "
          v-model:value="mosaicId"
        />
        <div class="row my-2 text-center">
          <div class="col-sm-12">
            <button
              type="button"
              class="btn btn-primary"
              v-on:click="onClickViewerResult"
            >
              {{ $t(`viewer.readData`) }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </section>
  <ModalComponent
    v-model:is-shown="isShownErrorModal"
    v-bind:title="$t('viewer.errorTitle')"
    v-bind:message="$t('viewer.errorMessage.' + errorCause)"
  />
</template>

<style scoped>
.btn.disabled {
  color: rgba(82, 82, 82, 0.6);
  cursor: default;
  pointer-events: none;
}
</style>
