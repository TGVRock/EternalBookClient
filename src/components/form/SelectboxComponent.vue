<script setup lang="ts">
import { ref } from "vue";
import type { SelectboxItemModel } from "@/models/SelectboxItemModel";
import type { SelectboxAttributeModel } from "@/models/SelectboxAttributeModel";

// Props
const props = defineProps<{
  attributes: SelectboxAttributeModel; // 属性
  items: Array<SelectboxItemModel>; // 表示アイテムリスト
  value: any; // 値
  size?: string; // ラベル
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: string): void;
}>();

// Reactives
const formSelectClass = ref("form-select");

// セレクトボックスのサイズ設定
switch (props.size) {
  case "sm":
  case "md":
  case "lg":
  case "xl":
    formSelectClass.value += "-" + props.size;
    break;

  default:
    break;
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
  <select
    v-bind="attributes"
    v-bind:value="value"
    v-on:change="onChange"
    v-bind:class="formSelectClass"
  >
    <option
      v-for="item in items"
      v-bind:key="`${attributes.ariaLabel}-${item.key}`"
      v-bind:value="item.value"
    >
      {{ item.display }}
    </option>
  </select>
</template>
