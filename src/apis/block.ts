import type { UInt64, BlockInfo } from "symbol-sdk";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";
import { ConvertRealTimestampFromTxTimestamp } from "@/utils/converter";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();

/**
 * ブロック情報取得
 * @param height ブロック高
 * @returns ブロック情報
 */
export async function getBlockInfo(
  height: UInt64
): Promise<BlockInfo | undefined> {
  const logTitle = "get block info:";
  if (typeof chainStore.blockRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  return await chainStore.blockRepo
    .getBlockByHeight(height)
    .toPromise()
    .then((value) => {
      return value;
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "failed.", error);
      return undefined;
    });
}

/**
 * ブロックの実時間タイムスタンプ取得
 * @param height ブロック高
 * @returns 実時間タイムスタンプ
 */
export async function getBlockTimestamp(
  height: UInt64
): Promise<number | undefined> {
  const logTitle = "get block timestamp:";
  if (typeof chainStore.blockRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  const mosaicBlockInfo = await getBlockInfo(height);
  if (typeof mosaicBlockInfo === "undefined") {
    settingsStore.logger.error(logTitle, "get block info failed.");
    return undefined;
  }
  return ConvertRealTimestampFromTxTimestamp(
    chainStore.epochAdjustment,
    mosaicBlockInfo.timestamp
  );
}
