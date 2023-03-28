<script setup lang="ts">
import { ref } from "vue";

// Props
const props = defineProps<{
  /** 値 */
  text: string;
}>();

// Reactives
const isPasswordVisible = ref(false);

/**
 * コピークリック
 */
function onClickCopy() {
  isPasswordVisible.value = true;
  navigator.clipboard.writeText(props.text);
}
</script>

<template>
  <div class="input-group">
    <input
      v-bind:value="text"
      type="text"
      class="form-control"
      readonly="true"
    />
    <i
      class="bi input-group-text"
      v-bind:class="{
        'bi-clipboard': !isPasswordVisible,
        'bi-clipboard-check-fill': isPasswordVisible,
      }"
      v-on:click="onClickCopy"
    ></i>
  </div>
</template>
