<script setup lang="ts">
import { ref, watch } from "vue";
import type { MosaicInfo } from "symbol-sdk";
import CONSTS from "@/utils/consts";
import { b2s } from "@/utils/converter";
import { getBlockTimestamp } from "@/apis/block";
import { getMosaicName } from "@/apis/namespace";
import MosaicInfoRowComponent from "./MosaicInfoRowComponent.vue";

// Props
const props = defineProps<{
  /** モザイク情報 */
  mosaicInfo: MosaicInfo;
}>();

// Reactives
const timestamp = ref(0);
const alias = ref<string>(CONSTS.STR_NA);

// Watch
watch(
  props.mosaicInfo,
  async (): Promise<void> => {
    // モザイク情報設定チェック
    if (typeof props.mosaicInfo === "undefined") {
      timestamp.value = 0;
      alias.value = CONSTS.STR_NA;
      return;
    }
    // モザイク情報が更新された場合、タイムスタンプとエイリアスを取得して設定する
    getBlockTimestamp(props.mosaicInfo.startHeight).then((value) => {
      timestamp.value = typeof value !== "undefined" ? value : 0;
    });
    getMosaicName(props.mosaicInfo.id).then((value) => {
      alias.value = typeof value !== "undefined" ? value : CONSTS.STR_NA;
    });
  },
  {
    immediate: true,
  }
);
</script>

<template>
  <article class="container">
    <div class="row">
      <div class="col-12 text-center">
        <h4>{{ $t("mosaicInfo.title") }}</h4>
      </div>
    </div>
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.id')"
      v-bind:data="mosaicInfo.id.toHex()"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.alias')"
      v-bind:data="alias"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.supply')"
      v-bind:data="mosaicInfo.supply.toString()"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.height')"
      v-bind:data="mosaicInfo.startHeight.toString()"
    />
    <MosaicInfoRowComponent
      v-if="timestamp > 0"
      v-bind:title="$t('mosaicInfo.date')"
      v-bind:data="$d(new Date(timestamp), 'long')"
    />
    <MosaicInfoRowComponent
      v-else
      v-bind:title="$t('mosaicInfo.date')"
      v-bind:data="CONSTS.STR_NA"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.address')"
      v-bind:data="mosaicInfo.ownerAddress.plain()"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.supplyMutable')"
      v-bind:data="b2s(mosaicInfo.flags.supplyMutable)"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.transferable')"
      v-bind:data="b2s(mosaicInfo.flags.transferable)"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.restrictable')"
      v-bind:data="b2s(mosaicInfo.flags.restrictable)"
    />
    <MosaicInfoRowComponent
      v-bind:title="$t('mosaicInfo.revokable')"
      v-bind:data="b2s(mosaicInfo.flags.revokable)"
    />
  </article>
</template>
