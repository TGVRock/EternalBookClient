<script setup lang="ts">
import { ref, watch } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useWriteMosaicStore } from "@/stores/WriteMosaic";
import type { MosaicItem } from "@/models/interfaces/MosaicItemModel";
import type { Address, MosaicId } from "symbol-sdk";
import { getMosaicsAboutCreatedAddress } from "@/apis/mosaic";
import { getMosaicsNames } from "@/apis/namespace";

// Stores
const settingsStore = useSettingsStore();
const writeMosaicStore = useWriteMosaicStore();

// Props
defineProps<{
  /** 値 */
  value: string;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:value", value: string): void;
}>();

// Reactives
const createdMosaics = ref<Array<MosaicItem>>([]);

// Watch
watch(
  () => writeMosaicStore.ownerInfo,
  (): void => {
    const logTitle = "created mosaic area watch:";
    settingsStore.logger.debug(
      logTitle,
      "start",
      writeMosaicStore.ownerAddress
    );

    // アカウント情報の取得
    createdMosaics.value = [];
    if (typeof writeMosaicStore.ownerInfo === "undefined") {
      settingsStore.logger.error(logTitle, "account info invalid.");
      return;
    }
    const address = writeMosaicStore.ownerInfo.address as Address;

    // 指定アドレスで作成したモザイク一覧を取得
    getMosaicsAboutCreatedAddress(address)
      .then(async (value) => {
        // 作成モザイク一覧を作成
        const mosaicIds: Array<MosaicId> = [];
        value.forEach((info) => {
          mosaicIds.push(info.id);
        });
        getMosaicsNames(mosaicIds)
          .then((value) => {
            mosaicIds.forEach((id) => {
              const name = value.find((name) => name.mosaicId.equals(id));
              const alias =
                typeof name === "undefined" || name.names.length === 0
                  ? ""
                  : name?.names[0].name;
              createdMosaics.value.push({
                id: id,
                alias: alias,
              });
            });
          })
          .catch((error) => {
            settingsStore.logger.error(
              logTitle,
              "get mosaics names failed.",
              error
            );
            createdMosaics.value = [];
          });
      })
      .catch((error) => {
        settingsStore.logger.error(logTitle, "get mosaics failed.", error);
        createdMosaics.value = [];
      });
    settingsStore.logger.debug(logTitle, "end");
  },
  { immediate: true }
);

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
          v-for="mosaic in createdMosaics"
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
