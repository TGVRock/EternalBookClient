<script setup lang="ts">
// Props
defineProps<{
  /** 表示するかどうか */
  isShown: boolean;
  /** タイトル */
  title: string;
  /** メッセージ */
  message: string;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:isShown", isShown: boolean): void;
}>();

/**
 * モーダルクローズ
 */
const onModalClose = (): void => {
  emit("update:isShown", false);
};
</script>

<template>
  <div class="modal fade" v-bind:class="{ show: isShown, 'd-block': isShown }">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            v-on:click="onModalClose"
          ></button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
  <div
    class="modal-backdrop fade"
    v-bind:class="{ show: isShown, 'pe-none': !isShown }"
  ></div>
</template>