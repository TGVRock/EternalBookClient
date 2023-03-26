<script setup lang="ts">
import InputPasswordComponent from "../form/InputPasswordComponent.vue";

// Props
defineProps<{
  /** 値 */
  value: string;
  /** 無効かどうか */
  disabled: boolean;
  /** テストモードかどうか */
  isTestMode: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: string): void;
}>();

/**
 * 変更イベント処理
 * @param e Event
 */
const onChange = (e: Event): void => {
  // 値を親コンポーネントへ渡す
  const elem = e.target as HTMLInputElement;
  emit("update:value", elem.value);
};
</script>

<template>
  <div class="row my-2">
    <label class="col-md-6 col-form-label">
      {{ $t("settings.secret") }}
      <p class="text-black-50 small">
        {{ $t("settings.secretSupplement") }}<br />
        <span class="text-danger">{{ $t("settings.secretImportant") }}</span>
      </p>
    </label>
    <div class="col-md-6">
      <InputPasswordComponent
        v-if="!disabled"
        v-bind:value="value"
        v-bind:is-test-mode="isTestMode"
        v-on:change="onChange"
        v-bind:placeholder="
          $t('writer.pleaseInputItem', { item: $t('settings.secret') })
        "
      />
      <InputPasswordComponent
        v-else
        v-bind:value="``"
        v-bind:disabled="disabled"
        v-bind:placeholder="$t('settings.secretSSSOn')"
      />
    </div>
  </div>
</template>
