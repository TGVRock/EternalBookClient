<script setup lang="ts">
import { ref } from "vue";
import SelectboxComponent from "@/components/form/SelectboxComponent.vue";
import CONSTS from "@/utils/consts";

// Props
const props = defineProps<{
  /** 値 */
  value: boolean;
  /** 無効かどうか */
  disabled: boolean;
  /** アドレス */
  address: string;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: boolean): void;
}>();

// Reactives
const isTestMode = ref(
  props.value ? CONSTS.STR_SELECT_ON : CONSTS.STR_SELECT_OFF
);

/**
 * 変更イベント処理
 */
const onChange = (): void => {
  // 値を親コンポーネントへ渡す
  emit("update:value", isTestMode.value === CONSTS.STR_SELECT_ON);
};
</script>

<template>
  <div class="row my-2">
    <label class="col-md-6 col-form-label">
      {{ $t("settings.testMode") }}
      <p class="text-black-50 small">
        {{ $t("settings.testModeSupplement") }}<br />
        <span class="text-danger">{{ $t("settings.testModeImportant") }}</span>
      </p>
    </label>
    <div class="col-md-6">
      <SelectboxComponent
        v-model:value="isTestMode"
        v-on:change="onChange"
        v-bind:attributes="{
          ariaLabel: 'test-mode',
          disabled: disabled,
        }"
        v-bind:items="[
          {
            key: CONSTS.STR_SELECT_ON,
            value: CONSTS.STR_SELECT_ON,
            display: $t('settings.selectOn'),
          },
          {
            key: CONSTS.STR_SELECT_OFF,
            value: CONSTS.STR_SELECT_OFF,
            display: $t('settings.selectOff'),
          },
        ]"
      />
      <div class="text-center">
        <a
          type="button"
          class="btn btn-secondary my-2"
          v-bind:class="{
            'btn-success': isTestMode === CONSTS.STR_SELECT_ON,
            disabled: isTestMode !== CONSTS.STR_SELECT_ON,
          }"
          v-bind:href="
            'https://testnet.symbol.tools/?recipient=' + address + '&amount=100'
          "
          target="_blank"
        >
          {{ $t("settings.accessFaucet") }}
        </a>
      </div>
    </div>
  </div>
</template>
