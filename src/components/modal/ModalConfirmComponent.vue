<script setup lang="ts">
// Props
defineProps<{
  /** 表示するかどうか */
  isShown: boolean;
  /** タイトル */
  title: string;
  /** 確認項目 */
  items: Array<{ key: string, value: string }>;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:isShown", isShown: boolean): void;
  (e: "confirmed", isConfirmed?: boolean): void;
}>();

/**
 * モーダルクローズ
 */
const onModalClose = (): void => {
  onCancelClick();
};
/**
 * OKクリック
 */
const onOkClick = (): void => {
  emit("update:isShown", false);
  emit("confirmed", true);
};
/**
 * キャンセルクリック
 */
const onCancelClick = (): void => {
  emit("update:isShown", false);
  emit("confirmed", false);
};
</script>

<template>
  <div class="modal fade" v-bind:class="{ show: isShown, 'd-block': isShown }">
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button
            type="button"
            class="btn-close"
            v-on:click="onModalClose"
          ></button>
        </div>
        <div class="modal-body container">
          <div class="mb-3 row" v-for="item in items" v-bind:key="item.key">
            <label class="col-12 col-form-label">{{ item.key }}</label>
            <div class="col-12">
              <label class="col-form-label px-3">{{ item.value }}</label>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-evenly">
          <button
            type="button"
            class="btn btn-success"
            v-on:click="onOkClick"
          >
            {{ $t("modal.ok") }}
          </button>
          <button
            type="button"
            class="btn btn-danger"
            v-on:click="onCancelClick"
          >
            {{ $t("modal.cancel") }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div
    class="modal-backdrop fade"
    v-bind:class="{ show: isShown, 'pe-none': !isShown }"
  ></div>
</template>

<style scoped>
.col-form-label {
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
