<script setup lang="ts">
import { ref } from "vue";
import SelectboxComponent from "@/components/form/SelectboxComponent.vue";

// Consts
const USE_SSS_ON = "on";
const USE_SSS_OFF = "off";

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
const isUseSSS = ref(props.value ? USE_SSS_ON : USE_SSS_OFF);

/**
 * 変更イベント処理
 */
const onChange = (): void => {
  // 値を親コンポーネントへ渡す
  emit("update:value", isUseSSS.value === USE_SSS_ON);
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
            key: USE_SSS_ON,
            value: USE_SSS_ON,
            display: $t('settings.useSSSOn'),
          },
          {
            key: USE_SSS_OFF,
            value: USE_SSS_OFF,
            display: $t('settings.useSSSOff'),
          },
        ]"
      />
    </div>
  </div>
</template>
