<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { NetworkType } from "symbol-sdk";
import { useSettingsStore } from "@/stores/settings";
import { useChainStore } from "@/stores/chain";
import { useSSSStore } from "@/stores/sss";
import NetworkTypeAreaComponent from "@/components/settings/NetworkTypeAreaComponent.vue";
import PrivateKeyAreaComponent from "@/components/settings/PrivateKeyAreaComponent.vue";
import UseSSSAreaComponent from "@/components/settings/UseSSSAreaComponent.vue";
import ModalComponent from "@/components/common/ModalComponent.vue";
import { createAccountFromPrivateKey } from "@/apis/account";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();
const sssStore = useSSSStore();

// Reactives
const netType = ref(chainStore.networkType);
const useSSS = ref(settingsStore.useSSS);
const privateKey = ref(settingsStore.privateKey);
const isChanged = computed(() => {
  return (
    chainStore.networkType !== netType.value ||
    settingsStore.useSSS !== useSSS.value ||
    (useSSS.value === false && settingsStore.privateKey !== privateKey.value)
  );
});
const isShownErrorModal = ref(false);
const errorCause = ref("privateKeyInvalid");

/**
 * 表示時に設定を元に戻す
 */
onMounted(() => {
  netType.value = chainStore.networkType;
  useSSS.value = settingsStore.useSSS;
  privateKey.value = settingsStore.privateKey;
});

/**
 * 設定適用
 */
const onApply = (): void => {
  const logTitle = "setting apply:";
  settingsStore.logger.debug(logTitle, "start");

  // SSSを利用する場合はネットワークタイプを変更
  if (useSSS.value) {
    netType.value = sssStore.networkType;
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
    settingsStore.account = inputAccount;
  }

  // アカウントの復元までできた場合は設定を反映する
  chainStore.networkType = netType.value;
  settingsStore.useSSS = useSSS.value;
  settingsStore.privateKey = privateKey.value;
  settingsStore.logger.debug(logTitle, "end");
};
</script>

<template>
  <section class="container animate__animated animate__fadeIn">
    <NetworkTypeAreaComponent v-model:value="netType" />
    <UseSSSAreaComponent
      v-model:value="useSSS"
      v-bind:disabled="!sssStore.sssLinked"
    />
    <PrivateKeyAreaComponent
      v-model:value="privateKey"
      v-bind:disabled="useSSS"
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
