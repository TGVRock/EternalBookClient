<script setup lang="ts">
// Props
defineProps<{
  itemName: string; // 表示項目名
  placeholder: string; // プレースホルダー
  rows: number; // 行数
  value: string; // 値
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
    <label class="col-md-3 col-form-label">
      {{ itemName }}
    </label>
    <div class="col-md-9">
      <textarea
        class="form-control"
        v-bind:value="value"
        v-on:change="onChange"
        v-bind:placeholder="placeholder"
        v-bind:rows="rows"
      ></textarea>
    </div>
  </div>
</template>
