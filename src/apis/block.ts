import type { UInt64, BlockInfo } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";
import { ConvertRealTimestampFromTxTimestamp } from "@/utils/converter";

// Stores
const envStore = useEnvironmentStore();

/**
 * ブロック情報取得
 * @param height ブロック高
 * @returns ブロック情報
 */
export async function getBlockInfo(
  height: UInt64
): Promise<BlockInfo | undefined> {
  const logTitle = "get block info:";
  if (typeof envStore.blockRepo === "undefined") {
    envStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  return await envStore.blockRepo.getBlockByHeight(height).toPromise();
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
  if (typeof envStore.blockRepo === "undefined") {
    envStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  const mosaicBlockInfo = await getBlockInfo(height);
  if (typeof mosaicBlockInfo === "undefined") {
    envStore.logger.error(logTitle, "get block info failed.");
    return undefined;
  }
  return ConvertRealTimestampFromTxTimestamp(
    envStore.epochAdjustment,
    mosaicBlockInfo.timestamp
  );
}
