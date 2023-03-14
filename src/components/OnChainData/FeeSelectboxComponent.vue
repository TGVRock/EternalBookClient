<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { SelectboxItemModel } from "@/models/interfaces/SelectboxItemModel";
import type { SelectboxAttributeModel } from "@/models/interfaces/SelectboxAttributeModel";
import { FeeKind } from "@/models/enums/FeeKind";
import SelectboxComponent from "@/components/form/SelectboxComponent.vue";

// Stores
const i18n = useI18n();

// Props
defineProps<{
  /** 値 */
  value: FeeKind;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: FeeKind): void;
}>();

// Reactives
const attributes = ref<SelectboxAttributeModel>({
  ariaLabel: "tx-fee",
});

const fees: Array<SelectboxItemModel> = [
  {
    key: "default",
    value: FeeKind.Default,
    display: i18n.t("preview.feeDefault"),
  },
  {
    key: "fast",
    value: FeeKind.Fast,
    display: i18n.t("preview.feeFast"),
  },
  {
    key: "average",
    value: FeeKind.Average,
    display: i18n.t("preview.feeAverage"),
  },
  {
    key: "slow",
    value: FeeKind.Slow,
    display: i18n.t("preview.feeSlow"),
  },
  {
    key: "slowest",
    value: FeeKind.Slowest,
    display: i18n.t("preview.feeSlowest"),
  },
];

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
    <div class="col-12">
      <SelectboxComponent
        v-bind:value="value"
        v-on:change="onChange"
        v-bind:attributes="attributes"
        v-bind:items="fees"
      />
    </div>
  </div>
</template>
