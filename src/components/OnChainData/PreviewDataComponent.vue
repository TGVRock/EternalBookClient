<script setup lang="ts">
import { computed } from "vue";
import {
  DATASIZE_PER_TX,
  DATA_TX_SIZE,
  OVERHEAD_SIZE_PER_TX,
  XYM_DIVISIBILITY,
  AGGREGATE_FEE_MULTIPLIER,
} from "@/utils/consts";
import { ConvertHumanReadableByteDataSize } from "@/utils/converter";
import MosaicInfoRowComponent from "../MosaicInfo/MosaicInfoRowComponent.vue";
import DataAreaComponent from "./DataAreaComponent.vue";

// Props
const props = defineProps<{
  base64: string; // Base64データ
  mime: string; // MIMEタイプ
}>();

// Reactives
const innerTxNum = computed(() => {
  return Math.ceil(props.base64.length / DATASIZE_PER_TX);
});
const aggTxNum = computed(() => {
  return Math.ceil(innerTxNum.value / DATA_TX_SIZE);
});
const predictFee = computed(() => {
  // 手数料は トランザクションサイズ x 乗数 [μXYM] で計算
  // トランザクションサイズ : [データサイズ] ＋ [インナートランザクションごとのオーバーヘッド] ＋ [ヘッダサイズ(オーバーヘッド含む)]
  return (
    (props.base64.length +
      innerTxNum.value * OVERHEAD_SIZE_PER_TX +
      aggTxNum.value * (DATASIZE_PER_TX + OVERHEAD_SIZE_PER_TX)) *
    AGGREGATE_FEE_MULTIPLIER *
    Math.pow(10, -1 * XYM_DIVISIBILITY)
  );
});
</script>

<template>
  <div class="row">
    <div class="col-lg-6 align-self-center text-center">
      <DataAreaComponent v-bind:base64="base64" v-bind:mime="mime" />
    </div>
    <div class="col-lg-6 align-self-center">
      <MosaicInfoRowComponent
        v-bind:title="$t('preview.dataSize')"
        v-bind:data="
          ConvertHumanReadableByteDataSize(base64.length) +
          ' ' +
          $t('preview.byte')
        "
      />
      <MosaicInfoRowComponent
        v-bind:title="$t('preview.entire')"
        v-bind:data="aggTxNum.toString()"
      />
      <MosaicInfoRowComponent
        v-bind:title="$t('preview.predictFee')"
        v-bind:data="predictFee.toFixed(6) + ' xym'"
      />
    </div>
  </div>
</template>
