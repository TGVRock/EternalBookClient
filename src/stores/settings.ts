import { ref } from "vue";
import { defineStore } from "pinia";
import { ConsoleLogger } from "@/utils/consolelogger";
import { UnavailableReason } from "@/models/enums/UnavailableReason";

/**
 * 設定情報ストア
 */
export const useSettingsStore = defineStore("settings", () => {
  /** SSS利用 */
  const useSSS = ref(true);
  /** 秘密鍵 */
  const privateKey = ref("");

  // Exports
  return {
    useSSS,
    privateKey,
  };
});
