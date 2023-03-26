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
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: boolean): void;
}>();

// Reactives
const isUseSSS = ref(
  props.value ? CONSTS.STR_SELECT_ON : CONSTS.STR_SELECT_OFF
);

/**
 * 変更イベント処理
 */
const onChange = (): void => {
  // 値を親コンポーネントへ渡す
  emit("update:value", isUseSSS.value === CONSTS.STR_SELECT_ON);
};
</script>

<template>
  <div class="row my-2">
    <label class="col-md-6 col-form-label">
      {{ $t("settings.useSSS") }}
      <p class="text-black-50 small">
        {{ $t("settings.useSSSSupplement") }}<br />
        <span class="text-danger">{{ $t("settings.useSSSImportant") }}</span>
      </p>
    </label>
    <div class="col-md-6">
      <SelectboxComponent
        v-model:value="isUseSSS"
        v-on:change="onChange"
        v-bind:attributes="{
          ariaLabel: 'use-sss',
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
    </div>
  </div>
</template>
