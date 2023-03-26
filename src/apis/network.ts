import type { TransactionFees } from "symbol-sdk";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";
import CONSTS from "@/utils/consts";
import { ConvertFee } from "@/utils/converter";
import type { FeeKind } from "@/models/enums/FeeKind";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();

/**
 * Tx手数料取得
 * @returns Tx手数料
 */
export async function getTxFees(): Promise<TransactionFees | undefined> {
  const logTitle = "get tx fees:";
  if (typeof chainStore.networkRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  return await chainStore.networkRepo.getTransactionFees().toPromise();
}

/**
 * 指定された種別のTx手数料取得
 * @param feeKind 手数料種別
 * @returns 指定された種別のTx手数料
 */
export async function getTxFee(feeKind: FeeKind): Promise<number> {
  const logTitle = "get tx fee:";

  // Tx手数料取得
  const txFees = await getTxFees();
  if (typeof txFees === "undefined") {
    settingsStore.logger.error(logTitle, "get tx fees failed.");
    return CONSTS.TX_FEE_MULTIPLIER_DEFAULT;
  }
  return ConvertFee(txFees, feeKind);
}
