<script setup lang="ts">
import { computed } from "vue";
import DataAreaComponent from "./flagments/DataAreaComponent.vue";
import FeeSelectboxComponent from "./flagments/FeeSelectboxComponent.vue";
import MosaicInfoRowComponent from "../MosaicInfo/MosaicInfoRowComponent.vue";
import FileSelectComponent from "../form/FileSelectButtonComponent.vue";
import TextAreaComponent from "@/components/form/TextAreaComponent.vue";
import TextareaAreaComponent from "@/components/form/TextareaAreaComponent.vue";
import CONSTS from "@/utils/consts";
import {
  ConvertHumanReadableByteDataSize,
  ConvertFee,
} from "@/utils/converter";
import { useEnvironmentStore } from "@/stores/environment";
import { useWriteOnChainDataStore } from "@/stores/WriteOnChainData";
import { getMimeFromBase64 } from "@/utils/mime";
import { FeeKind } from "@/models/enums/FeeKind";
import { getTxFees } from "@/apis/network";

// Stores
const envStore = useEnvironmentStore();
const writeOnChainDataStore = useWriteOnChainDataStore();

// Reactives
const innerTxNum = computed(() => {
  return Math.ceil(
    writeOnChainDataStore.dataBase64.length / CONSTS.TX_DATASIZE_PER_TRANSFER
  );
});
const aggTxNum = computed(() => {
  return Math.ceil(innerTxNum.value / CONSTS.TX_DATA_TX_NUM);
});
const predictFee = computed(() => {
  // 手数料は Txサイズ x 乗数 [μXYM] で計算
  // Txサイズ : [データサイズ] ＋ [インナーTxごとのオーバーヘッド] ＋ [ヘッダサイズ(オーバーヘッド含む)]
  return (
    (writeOnChainDataStore.dataBase64.length +
      innerTxNum.value * CONSTS.TX_OVERHEAD_SIZE_PER_INNER +
      aggTxNum.value *
        (CONSTS.TX_DATASIZE_PER_TRANSFER + CONSTS.TX_OVERHEAD_SIZE_PER_INNER)) *
    (fees.get(envStore.feeKind) || CONSTS.TX_FEE_MULTIPLIER_DEFAULT) *
    Math.pow(10, -1 * CONSTS.TX_XYM_DIVISIBILITY)
  );
});

// 手数料乗数
const fees = new Map<FeeKind, number>([
  [FeeKind.Default, CONSTS.TX_FEE_MULTIPLIER_DEFAULT],
  [FeeKind.Fast, CONSTS.TX_FEE_MULTIPLIER_DEFAULT],
  [FeeKind.Average, CONSTS.TX_FEE_MULTIPLIER_DEFAULT],
  [FeeKind.Slow, CONSTS.TX_FEE_MULTIPLIER_DEFAULT],
  [FeeKind.Slowest, CONSTS.TX_FEE_MULTIPLIER_DEFAULT],
]);
// 手数料乗数をネットワークから取得
getTxFees().then((txFees) => {
  if (typeof txFees === "undefined") {
    return;
  }
  fees.set(FeeKind.Fast, ConvertFee(txFees, FeeKind.Fast));
  fees.set(FeeKind.Average, ConvertFee(txFees, FeeKind.Average));
  fees.set(FeeKind.Slow, ConvertFee(txFees, FeeKind.Slow));
  fees.set(FeeKind.Slowest, ConvertFee(txFees, FeeKind.Slowest));
});
</script>

<template>
  <section class="row my-2">
    <div class="col-lg-6 align-self-center text-center">
      <DataAreaComponent
        v-bind:base64="writeOnChainDataStore.dataBase64"
        v-bind:mime="getMimeFromBase64(writeOnChainDataStore.dataBase64)"
      />
    </div>
    <div class="col-lg-6 align-self-center">
      <TextAreaComponent
        v-bind:item-name="$t('preview.title')"
        v-bind:placeholder="
          $t('writer.pleaseInputItem', { item: $t('preview.title') })
        "
        v-model:value="writeOnChainDataStore.title"
      />
      <TextareaAreaComponent
        v-bind:item-name="$t('preview.message')"
        v-bind:placeholder="
          $t('writer.pleaseInputItem', { item: $t('preview.message') })
        "
        v-bind:rows="5"
        v-model:value="writeOnChainDataStore.message"
      />
      <FeeSelectboxComponent v-model:value="envStore.feeKind" />
      <FileSelectComponent v-model:base64="writeOnChainDataStore.dataBase64" />
      <div class="my-2" v-if="aggTxNum === 0">
        <h6>{{ $t("preview.info") }}</h6>
        <p>{{ $t("preview.notice") }}</p>
      </div>
      <div class="animate__animated animate__fadeIn my-2" v-else>
        <h6>{{ $t("preview.info") }}</h6>
        <MosaicInfoRowComponent
          v-bind:title="$t('preview.dataSize')"
          v-bind:data="
            ConvertHumanReadableByteDataSize(
              writeOnChainDataStore.dataBase64.length
            ) +
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
  </section>
</template>
