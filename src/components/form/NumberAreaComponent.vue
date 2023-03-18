<script setup lang="ts">
// Props
defineProps<{
  /** 表示項目名 */
  itemName: string;
  /** プレースホルダー */
  placeholder: string;
  /** 値 */
  value: number;
  /** 最小値 */
  min: number;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: number): void;
}>();

/**
 * 変更イベント処理
 * @param e Event
 */
const onChange = (e: Event): void => {
  // 値を親コンポーネントへ渡す
  const elem = e.target as HTMLInputElement;
  emit("update:value", Number(elem.value));
};
</script>

<template>
  <div class="row my-2">
    <label class="col-md-3 col-form-label">
      {{ itemName }}
    </label>
    <div class="col-md-9">
      <input
        type="number"
        v-bind:value="value"
        v-on:change="onChange"
        class="form-control"
        v-bind:placeholder="placeholder"
        v-bind:min="min"
      />
    </div>
  </div>
</template>
