<script setup lang="ts">
import {
  DATASIZE_PER_TX,
  DATA_TX_SIZE,
  MAX_FEE_PRE_AGG_TX,
  OVERHEAD_SIZE_PER_TX,
  XYM_DIVISIBILITY,
  AGGREGATE_FEE_MULTIPLIER,
} from "@/utils/consts";
import MosaicInfoRowComponent from "../MosaicInfo/MosaicInfoRowComponent.vue";
import DataAreaComponent from "./DataAreaComponent.vue";
import { ConvertHumanReadableByteDataSize } from "@/utils/converter";
import { computed } from "vue";

const props = defineProps<{
  base64: string;
  mime: string;
}>();

const innerTxNum = computed(() => {
  return Math.ceil(props.base64.length / DATASIZE_PER_TX);
});
const aggTxNum = computed(() => {
  return Math.ceil(innerTxNum.value / DATA_TX_SIZE);
});
const predictFee = computed(() => {
  const countedInnerTxNum = Math.floor(innerTxNum.value / DATA_TX_SIZE);
  const modInnerTxNum = innerTxNum.value % DATA_TX_SIZE;
  const modDataLength =
    props.base64.length - countedInnerTxNum * DATASIZE_PER_TX;
  return (
    countedInnerTxNum * MAX_FEE_PRE_AGG_TX +
    Math.min(
      (modDataLength +
        modInnerTxNum * OVERHEAD_SIZE_PER_TX +
        aggTxNum.value * (DATASIZE_PER_TX + OVERHEAD_SIZE_PER_TX)) *
        AGGREGATE_FEE_MULTIPLIER *
        Math.pow(10, -1 * XYM_DIVISIBILITY),
      MAX_FEE_PRE_AGG_TX
    )
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
