import { ref } from "vue";
import { defineStore } from "pinia";
import type { Account } from "symbol-sdk";
import { ConsoleLogger } from "@/utils/consolelogger";
import { UnavailableReason } from "@/models/enums/UnavailableReason";
import { FeeKind } from "@/models/enums/FeeKind";

/**
 * 設定情報ストア
 */
export const useSettingsStore = defineStore("settings", () => {
  /** ツール利用可否 */
  const isAvailable = ref(true);
  /** ツール利用不可時の理由 */
  const unavailableReason = ref(UnavailableReason.Bug);
  /** ロガー */
  const logger = new ConsoleLogger();

  /** SSS利用 */
  const useSSS = ref(false);
  /** 秘密鍵 */
  const privateKey = ref("");
  /** アカウント */
  const account = ref<Account | undefined>(undefined);
  /** 手数料種別 */
  const feeKind = ref(FeeKind.Default);

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
  // TODO: 暫定で特定時間を利用不可とする
  const nowDate = new Date();
  if (nowDate.getMinutes() >= 0 && nowDate.getMinutes() < 5) {
    if (nowDate.getHours() === 0) {
      isAvailable.value = false;
      unavailableReason.value = UnavailableReason.Error;
    } else if (nowDate.getHours() === 4) {
      isAvailable.value = false;
      unavailableReason.value = UnavailableReason.Maintainance;
    }
  }

  // Exports
  return {
    isAvailable,
    unavailableReason,
    logger,
    useSSS,
    privateKey,
    account,
    feeKind,
  };
});
