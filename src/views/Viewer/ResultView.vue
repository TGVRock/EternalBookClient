<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import type { MosaicInfo, NetworkType } from "symbol-sdk";
import ProcessingComponent from "@/components/Progress/ProcessingComponent.vue";
import LinkUrlCopyAreaComponent from "@/components/MosaicInfo/LinkUrlCopyAreaComponent.vue";
import MosaicInfoComponent from "@/components/MosaicInfo/MosaicInfoComponent.vue";
import OnChainDataComponent from "@/components/OnChainData/OnChainDataComponent.vue";
import { useSettingsStore } from "@/stores/settings";
import { getMosaicInfo } from "@/apis/mosaic";
import { useChainStore } from "@/stores/chain";
import { useEternalBookStore } from "@/stores/eternalbook";
import { SettingState } from "@/models/enums/SettingState";
import CONSTS from "@/utils/consts";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();
const eternalBookStore = useEternalBookStore();

// Props
const props = defineProps<{
  netType: NetworkType;
  mosaicId: string;
}>();

// Reactives
const mosaicInfo = ref<MosaicInfo | undefined>(undefined);

// 現在のネットワークタイプを退避
const beforeNetType = chainStore.networkType;
const logTitle = "viewer result:";
// リンクURLを設定
const linkUrl =
  settingsStore.rootUri +
  "?netType=" +
  props.netType +
  "&mosaicId=" +
  props.mosaicId;

/**
 * 表示時処理
 */
onMounted(() => {
  // ネットワークタイプが異なる場合は変更
  if (chainStore.networkType !== props.netType) {
    settingsStore.logger.debug(logTitle, "network change.");
    chainStore.networkType = props.netType;
  }

  // 定周期でチェーンの設定状態を確認
  const checkChainSettingStatus = setInterval(() => {
    // チェーンの設定が完了したら実処理を行う
    if (chainStore.settingState === SettingState.Ready) {
      settingsStore.logger.debug(logTitle, "chain ready.");
      clearInterval(checkChainSettingStatus);

      // モザイク情報の取得
      getMosaicInfo(props.mosaicId)
        .then((value) => {
          settingsStore.logger.debug(logTitle, "get mosaic info complete.");
          mosaicInfo.value = value;
        })
        .catch((error) => {
          settingsStore.logger.error(
            logTitle,
            "get mosaic info failed.",
            error
          );
        });
    }
  }, CONSTS.CHANGE_SETTING_CONFIRM_INTERVAL_MSEC);
});

/**
 * 非表示時処理
 */
onUnmounted(() => {
  // ネットワークタイプ復元
  restoreNetworkType();
});

/**
 * ネットワークタイプの復元
 */
function restoreNetworkType() {
  // ネットワークタイプを変更している場合は元に戻す
  if (chainStore.networkType !== beforeNetType) {
    settingsStore.logger.debug(logTitle, "network restore.");
    chainStore.networkType = beforeNetType;
  }
}

// Watch
watch(mosaicInfo, async (): Promise<void> => {
  const logTitle = "viewer result watch:";
  settingsStore.logger.debug(logTitle, "start", mosaicInfo.value);

  // モザイクに紐づいたオンチェーンデータを取得
  if (typeof mosaicInfo.value === "undefined") {
    settingsStore.logger.error(logTitle, "not exist mosaic info.");
    return;
  }
  eternalBookStore
    .getEBPOnChainData(chainStore.networkType, mosaicInfo.value as MosaicInfo)
    .then(() => {
      settingsStore.logger.debug(logTitle, "get on chain data complete.");
      // ネットワークタイプ復元
      restoreNetworkType();
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "get on chain data failed.", error);
      // ネットワークタイプ復元
      restoreNetworkType();
    });
  settingsStore.logger.debug(logTitle, "end");
});
</script>

<template>
  <LinkUrlCopyAreaComponent v-bind:linkUrl="linkUrl" />
  <ProcessingComponent
    v-if="eternalBookStore.chainData.size === 0"
    v-bind:message="$t('message.loading')"
  />
  <OnChainDataComponent
    v-else
    v-for="[hash, value] in eternalBookStore.chainData"
    v-bind:key="hash"
    v-bind:onChainDataList="value"
    class="container animate__animated animate__fadeIn text-break"
  />
  <ProcessingComponent
    v-if="typeof mosaicInfo === 'undefined'"
    v-bind:message="$t('message.loading')"
  />
  <MosaicInfoComponent
    v-else
    v-bind:mosaic-info="(mosaicInfo as MosaicInfo)"
    class="container animate__animated animate__fadeIn text-break"
  />
</template>
