<script setup lang="ts">
import { computed } from "vue";
import CONSTS from "@/utils/consts";
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
  return Math.ceil(props.base64.length / CONSTS.TX_DATASIZE_PER_TRANSFER);
});
const aggTxNum = computed(() => {
  return Math.ceil(innerTxNum.value / CONSTS.TX_DATA_TX_NUM);
});
const predictFee = computed(() => {
  // 手数料は トランザクションサイズ x 乗数 [μXYM] で計算
  // トランザクションサイズ : [データサイズ] ＋ [インナートランザクションごとのオーバーヘッド] ＋ [ヘッダサイズ(オーバーヘッド含む)]
  return (
    (props.base64.length +
      innerTxNum.value * CONSTS.TX_OVERHEAD_SIZE_PER_INNER +
      aggTxNum.value *
        (CONSTS.TX_DATASIZE_PER_TRANSFER + CONSTS.TX_OVERHEAD_SIZE_PER_INNER)) *
    CONSTS.TX_FEE_MULTIPLIER_DEFAULT *
    Math.pow(10, -1 * CONSTS.TX_DIVISIBILITY_XYM)
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
