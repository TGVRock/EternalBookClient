<script setup lang="ts">
import { ref } from "vue";

// Props
defineProps<{
  /** プレースホルダー */
  placeholder: string;
  /** 値 */
  value: string;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: string): void;
}>();

// Reactives
const isPasswordVisible = ref(false);

/**
 * パスワード表示変更
 */
function onTogglePasswordVisible() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

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
  <div class="input-group">
    <input
      v-bind:value="value"
      v-bind:type="isPasswordVisible ? `text` : `password`"
      v-on:change="onChange"
      class="form-control"
      autocomplete="off"
      autocorrect="off"
      v-bind:placeholder="placeholder"
    />
    <i
      class="bi input-group-text"
      v-bind:class="{
        'bi-eye': !isPasswordVisible,
        'bi-eye-slash': isPasswordVisible,
      }"
      v-on:click="onTogglePasswordVisible"
    ></i>
  </div>
</template>
