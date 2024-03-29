<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { NetworkType, UInt64 } from "symbol-sdk";
import { useSettingsStore } from "@/stores/settings";
import { useChainStore } from "@/stores/chain";
import { useSSSStore } from "@/stores/sss";
import NetworkTypeAreaComponent from "@/components/settings/NetworkTypeAreaComponent.vue";
import TestModeAreaComponent from "@/components/settings/TestModeAreaComponent.vue";
import PrivateKeyAreaComponent from "@/components/settings/PrivateKeyAreaComponent.vue";
import UseSSSAreaComponent from "@/components/settings/UseSSSAreaComponent.vue";
import ModalComponent from "@/components/common/ModalComponent.vue";
import {
  createAccountFromPrivateKey,
  getTestAccountInfo,
  announceTestAccountPublicKey,
} from "@/apis/account";
import { useAccountStore } from "@/stores/account";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();
const sssStore = useSSSStore();
useAccountStore();

// Reactives
const netType = ref(chainStore.networkType);
const useSSS = ref(settingsStore.useSSS);
const isTestMode = ref(settingsStore.isTestMode);
const privateKey = ref(settingsStore.privateKey);
const isChanged = computed(() => {
  return (
    chainStore.networkType !== netType.value ||
    settingsStore.useSSS !== useSSS.value ||
    (useSSS.value === false &&
      (settingsStore.isTestMode !== isTestMode.value ||
        settingsStore.privateKey !== privateKey.value))
  );
});
const isShownErrorModal = ref(false);
const errorCause = ref("privateKeyInvalid");

/**
 * 初期表示は現在の設定
 */
onMounted(() => {
  netType.value = chainStore.networkType;
  useSSS.value = settingsStore.useSSS;
  isTestMode.value = settingsStore.isTestMode;
  privateKey.value = settingsStore.privateKey;
});

// Watch
watch(useSSS, () => {
  if (useSSS.value) {
    isTestMode.value = false;
    netType.value = sssStore.networkType;
  }
});
watch(isTestMode, () => {
  if (isTestMode.value) {
    netType.value = NetworkType.TEST_NET;
    privateKey.value = settingsStore.testAccount.privateKey;
  }
});

/**
 * 設定適用
 */
const onApply = async (): Promise<void> => {
  const logTitle = "setting apply:";
  settingsStore.logger.debug(logTitle, "start");

  // モードに応じた設定変更
  if (useSSS.value) {
    netType.value = sssStore.networkType;
    privateKey.value = "";
  } else if (isTestMode.value) {
    netType.value = NetworkType.TEST_NET;
    privateKey.value = settingsStore.testAccount.privateKey;
  }

  // ネットワークタイプのチェック
  if (
    netType.value !== NetworkType.MAIN_NET &&
    netType.value !== NetworkType.TEST_NET
  ) {
    settingsStore.logger.error(logTitle, "input network type invaild.");
    errorCause.value = "networkTypeInvalid";
    isShownErrorModal.value = true;
    return;
  }

  // SSS利用の不正入力チェック
  if (sssStore.sssLinked === false && useSSS.value === true) {
    settingsStore.logger.error(logTitle, "input use sss invaild.");
    errorCause.value = "useSSSInvalid";
    isShownErrorModal.value = true;
    return;
  }

  // 入力された秘密鍵からアカウントを復元する
  if (useSSS.value === false) {
    const inputAccount = createAccountFromPrivateKey(
      privateKey.value,
      netType.value
    );
    if (typeof inputAccount === "undefined") {
      settingsStore.logger.error(logTitle, "input private key invaild.");
      errorCause.value = "privateKeyInvalid";
      isShownErrorModal.value = true;
      return;
    }

    // テストモードの場合、XYMを取得しているか、アカウント情報を取得して確認する
    if (isTestMode.value) {
      const info = await getTestAccountInfo(inputAccount.address.plain());
      if (typeof info === "undefined") {
        isShownErrorModal.value = true;
        errorCause.value = "getFausetFailed";
        return;
      }
      // 初回は公開鍵がネットワークに認知されていないため、自身へTx送信して認知させる
      if (info.publicKeyHeight.equals(UInt64.fromUint(0))) {
        const result = await announceTestAccountPublicKey(inputAccount);
        if (!result) {
          isShownErrorModal.value = true;
          errorCause.value = "getFausetFailed";
          return;
        }
      }
    }
    settingsStore.account = inputAccount;
  }

  // アカウントの復元までできた場合は設定を反映する
  chainStore.networkType = netType.value;
  settingsStore.useSSS = useSSS.value;
  settingsStore.isTestMode = isTestMode.value;
  settingsStore.privateKey = privateKey.value;
  settingsStore.logger.debug(logTitle, "end");
};
</script>

<template>
  <section class="container animate__animated animate__fadeIn">
    <UseSSSAreaComponent
      v-model:value="useSSS"
      v-bind:disabled="!sssStore.sssLinked"
    />
    <TestModeAreaComponent
      v-model:value="isTestMode"
      v-bind:disabled="useSSS"
      v-bind:address="settingsStore.testAccount.address.plain()"
    />
    <NetworkTypeAreaComponent
      v-model:value="netType"
      v-bind:disabled="useSSS || isTestMode"
    />
    <PrivateKeyAreaComponent
      v-model:value="privateKey"
      v-bind:disabled="useSSS"
      v-bind:is-test-mode="isTestMode"
    />
    <div class="row my-2">
      <div class="col text-center">
        <button
          type="button"
          class="btn btn-primary"
          v-on:click="onApply"
          v-bind:disabled="!isChanged"
          v-bind:class="{ 'btn-secondary': !isChanged }"
        >
          {{ $t("settings.apply") }}
        </button>
      </div>
    </div>
  </section>
  <ModalComponent
    v-model:is-shown="isShownErrorModal"
    v-bind:title="$t('settings.errorTitle')"
    v-bind:message="$t('settings.errorMessage.' + errorCause)"
  />
</template>
