<script setup lang="ts">
// Props
const props = defineProps<{
  id: string; // Element id
  itemName: string; // 表示項目名
  checked: boolean; // チェック状態
}>();

// Emits
const emit = defineEmits<{
  (e: "update:checked", checked: boolean): void;
}>();

const elemId = "cb" + props.id;

/**
 * 変更イベント処理
 * @param e Event
 */
const onChange = (e: Event): void => {
  // チェック状態を親コンポーネントへ渡す
  const elem = e.target as HTMLInputElement;
  emit("update:checked", elem.checked);
};
</script>

<template>
  <div class="form-check">
    <input
      type="checkbox"
      v-bind:value="checked"
      v-on:change="onChange"
      class="form-check-input"
      v-bind:id="elemId"
    />
    <label class="form-check-label" v-bind:for="elemId">
      {{ itemName }}
    </label>
  </div>
</template>
