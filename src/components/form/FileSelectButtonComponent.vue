<script setup lang="ts">
// Props
defineProps<{
  /** 読み込んだBase64データ */
  base64: string;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:base64", base64: string): void;
}>();

/**
 * 変更イベント処理
 * @param e Event
 */
const onChange = (e: Event): void => {
  // ファイル選択確認
  const target = (e.target as HTMLInputElement).files || null;
  if (
    target === null ||
    typeof target.length === "undefined" ||
    target.length < 1
  ) {
    return;
  }
  // ファイル読み込み
  const fileReader = new FileReader();
  fileReader.onload = () => {
    // 読み込んだデータを親コンポーネントへ渡す
    emit("update:base64", fileReader.result as string);
  };
  fileReader.readAsDataURL(target[0]);
};
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="input-group justify-content-around">
        <label class="input-group-btn">
          <div class="btn btn-primary">
            <span id="buttonSelectFileText">{{ $t("writer.fileSelect") }}</span>
            <input type="file" class="d-none" v-on:change="onChange" />
          </div>
        </label>
      </div>
    </div>
  </div>
</template>
