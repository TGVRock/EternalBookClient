<script setup lang="ts">
import { useAccountStore } from "@/stores/account";

// Stores
const accountStore = useAccountStore();

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
    <label class="col-md-3 col-form-label">
      {{ $t("mosaicInfo.id") }}
    </label>
    <div class="col-md-9">
      <select
        v-bind:aria-label="'owned-mosaic'"
        v-bind:value="value"
        v-on:change="onChange"
        class="form-select"
      >
        <option
          v-for="mosaic in accountStore.owendMosaics"
          v-bind:key="mosaic.id.toHex()"
          v-bind:value="mosaic.id.toHex()"
        >
          {{
            mosaic.alias.length > 0
              ? mosaic.alias + " (ID: " + mosaic.id.toHex() + ")"
              : mosaic.id.toHex()
          }}
        </option>
      </select>
    </div>
  </div>
</template>
