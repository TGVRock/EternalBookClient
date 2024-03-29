import { ref } from "vue";
import { defineStore } from "pinia";
import { Account, NetworkType } from "symbol-sdk";
import { ConsoleLogger } from "@/utils/consolelogger";
import { UnavailableReason } from "@/models/enums/UnavailableReason";
import { FeeKind } from "@/models/enums/FeeKind";

/**
 * 設定情報ストア
 */
export const useSettingsStore = defineStore("settings", () => {
  /** ルートURI */
  const rootUri = ref("");
  /** ツール利用可否 */
  const isAvailable = ref(true);
  /** ツール利用不可時の理由 */
  const unavailableReason = ref(UnavailableReason.Bug);
  /** ロガー */
  const logger = new ConsoleLogger();
  /** アドレス文字列 */
  const addressStr = ref("");

  /** SSS利用 */
  const useSSS = ref(false);
  /** テストモード */
  const isTestMode = ref(false);
  /** 秘密鍵 */
  const privateKey = ref("");
  /** アカウント */
  const account = ref<Account | undefined>(undefined);
  /** 手数料種別 */
  const feeKind = ref(FeeKind.Default);
  /** テストアカウント */
  const testAccount = ref(Account.generateNewAccount(NetworkType.TEST_NET));

  // ツール利用可否の設定
  try {
    fetch("https://tgvrock.github.io/SymbolOnChainDataViewer/", {
      method: "GET",
    })
      .then(() => {})
      .catch(() => {
        isAvailable.value = false;
        unavailableReason.value = UnavailableReason.Bug;
      });
  } catch (error) {
    isAvailable.value = false;
    unavailableReason.value = UnavailableReason.Bug;
  }
  // TODO: なんかあった時はこっちを使う
  // 何かのエラー
  // isAvailable.value = false;
  // unavailableReason.value = UnavailableReason.Error;
  // メンテナンスモード
  // isAvailable.value = false;
  // unavailableReason.value = UnavailableReason.Maintainance;

  // Exports
  return {
    rootUri,
    isAvailable,
    unavailableReason,
    logger,
    addressStr,
    useSSS,
    isTestMode,
    privateKey,
    account,
    feeKind,
    testAccount,
  };
});
