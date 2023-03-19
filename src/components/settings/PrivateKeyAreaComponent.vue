<script setup lang="ts">
import InputPasswordComponent from "../form/InputPasswordComponent.vue";

// Props
defineProps<{
  /** 値 */
  value: string;
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
    </label>
    <div class="col-md-6">
      <InputPasswordComponent
        v-bind:value="value"
        v-on:change="onChange"
        v-bind:item-name="$t('settings.secret')"
        v-bind:placeholder="
          $t('writer.pleaseInputItem', { item: $t('settings.secret') })
        "
      />
    </div>
  </div>
</template>
