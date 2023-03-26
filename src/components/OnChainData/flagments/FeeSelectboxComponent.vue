<script setup lang="ts">
import { FeeKind } from "@/models/enums/FeeKind";
import SelectboxComponent from "@/components/form/SelectboxComponent.vue";

// Props
defineProps<{
  /** 値 */
  value: FeeKind;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: FeeKind): void;
}>();

/**
 * 変更イベント処理
 * @param e Event
 */
const onChange = (e: Event): void => {
  // 値を親コンポーネントへ渡す
  const elem = e.target as HTMLInputElement;
  emit("update:value", elem.value as FeeKind);
};
</script>

<template>
  <div class="row my-2">
    <label class="col-md-3 col-form-label">
      {{ $t("preview.fee") }}
    </label>
    <div class="col-md-9">
      <SelectboxComponent
        v-bind:value="value"
        v-on:change="onChange"
        v-bind:attributes="{
          ariaLabel: 'tx-fee',
        }"
        v-bind:items="[
          {
            key: 'default',
            value: FeeKind.Default,
            display: $t('preview.feeDefault'),
          },
          {
            key: 'fast',
            value: FeeKind.Fast,
            display: $t('preview.feeFast'),
          },
          {
            key: 'average',
            value: FeeKind.Average,
            display: $t('preview.feeAverage'),
          },
          {
            key: 'slow',
            value: FeeKind.Slow,
            display: $t('preview.feeSlow'),
          },
          {
            key: 'slowest',
            value: FeeKind.Slowest,
            display: $t('preview.feeSlowest'),
          },
        ]"
      />
    </div>
  </div>
</template>
