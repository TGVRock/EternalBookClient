<script setup lang="ts">
import { NetworkType } from "symbol-sdk";
import SelectboxComponent from "@/components/form/SelectboxComponent.vue";

// Props
defineProps<{
  /** 値 */
  value: NetworkType;
  /** 無効かどうか */
  disabled: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: NetworkType): void;
}>();

/**
 * 変更イベント処理
 * @param e Event
 */
const onChange = (e: Event): void => {
  // 値を親コンポーネントへ渡す
  const elem = e.target as HTMLInputElement;
  emit("update:value", Number(elem.value) as NetworkType);
};
</script>

<template>
  <div class="row my-2">
    <label class="col-md-6 col-form-label">
      {{ $t("settings.netType") }}
      <p class="text-black-50 small">{{ $t("settings.netTypeSupplement") }}</p>
    </label>
    <div class="col-md-6">
      <SelectboxComponent
        v-bind:value="value"
        v-on:change="onChange"
        v-bind:attributes="{
          ariaLabel: 'network-type',
          disabled: disabled,
        }"
        v-bind:items="[
          {
            key: 'MAIN',
            value: NetworkType.MAIN_NET,
            display: $t('networkTypes.main'),
          },
          {
            key: 'TEST',
            value: NetworkType.TEST_NET,
            display: $t('networkTypes.test'),
          },
        ]"
      />
    </div>
  </div>
</template>
