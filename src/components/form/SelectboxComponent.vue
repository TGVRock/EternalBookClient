<script setup lang="ts">
import { ref } from "vue";
import type { SelectboxItemModel } from "@/models/interfaces/SelectboxItemModel";
import type { SelectboxAttributeModel } from "@/models/interfaces/SelectboxAttributeModel";

// Props
const props = defineProps<{
  /** 属性 */
  attributes: SelectboxAttributeModel;
  /** 表示アイテムリスト */
  items: Array<SelectboxItemModel>;
  /** 値 */
  value: any;
  /** ラベル */
  size?: string;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: any): void;
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
