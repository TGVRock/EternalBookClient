import { ref } from "vue";
import { defineStore } from "pinia";
import { TransactionType } from "symbol-sdk";
import type { NetworkType, MosaicInfo } from "symbol-sdk";
import { useSettingsStore } from "./settings";
import type { OnChainData } from "@/models/interfaces/OnChainDataModel";
import { getTransactions } from "@/apis/transaction";
import CONSTS from "@/utils/consts";
import { getHash } from "@/utils/crypto";
import { getMimeFromBase64 } from "@/utils/mime";
import type { DataFragment } from "@/models/interfaces/DataFragmentModel";
import { getDataFragment } from "@/utils/eternalbookprotocol";

/**
 * オンチェーンデータ情報ストア
 */
export const useEternalBookStore = defineStore("eternalbook", () => {
  // Other Stores
  const settingsStore = useSettingsStore();

  /** オンチェーンデータ */
  const chainData = ref<Map<string, OnChainData>>(
    new Map<string, OnChainData>()
  );

  /**
   * EternalBookProtocol のオンチェーンデータ取得
   * @param mosaicInfo 取得する紐付けモザイクのモザイク情報
   * @returns オンチェーンデータリスト
   */
  async function getEBPOnChainData(
    netType: NetworkType,
    mosaicInfo: MosaicInfo
  ): Promise<void> {
    const logTitle = "get EternalBookProtocol data:";
    settingsStore.logger.debug(logTitle, "start");

    // モザイク作成者のアグリゲートTxを全て取得
    const allAggTxes = await getTransactions(
      mosaicInfo.ownerAddress,
      [TransactionType.AGGREGATE_COMPLETE, TransactionType.AGGREGATE_BONDED],
      mosaicInfo.startHeight
    );
    // アグリゲートTxがない場合はオンチェーンデータも存在しないため終了
    if (allAggTxes.length === 0) {
      settingsStore.logger.debug(
        logTitle,
        "not exist EternalBookProtocol data"
      );
      return;
    }

    // アグリゲートTxからデータを抽出して復元する
    while (allAggTxes.length > 0) {
      // 最新Txの取得
      const aggTx = allAggTxes.pop();
      if (typeof aggTx?.transactionInfo?.hash === "undefined") {
        settingsStore.logger.error(logTitle, "aggregate tx hash undefined.");
        settingsStore.logger.debug(logTitle, "aggregate tx:", aggTx);
        continue;
      }

      // データフラグメントの取得
      const lastFragment = await getDataFragment(aggTx, mosaicInfo);
      if (typeof lastFragment === "undefined") {
        settingsStore.logger.error(logTitle, "fragment undefined.");
        settingsStore.logger.debug(logTitle, "aggregate tx:", aggTx);
        continue;
      }

      // Txをさかのぼってデータを復元
      let fragment: DataFragment | undefined = lastFragment;
      let data = lastFragment.data;
      let prevHash = lastFragment.header.prevTx;
      while (prevHash !== null && prevHash.length > 0) {
        const prevAggTxIdx = allAggTxes.findIndex(
          (data) => data?.transactionInfo?.hash === prevHash
        );
        if (prevAggTxIdx < 0) {
          prevHash = "";
          break;
        }
        const prevAggTx = allAggTxes[prevAggTxIdx];
        allAggTxes.splice(prevAggTxIdx, 1);
        fragment = await getDataFragment(prevAggTx, mosaicInfo);
        if (typeof fragment === "undefined") {
          settingsStore.logger.error(logTitle, "fragment undefined.");
          settingsStore.logger.debug(logTitle, "aggregate tx:", prevAggTx);
          prevHash = "";
          break;
        }
        data = fragment.data + data;
        prevHash = fragment.header.prevTx;
      }

      // ハッシュが一致する場合のみ正しいオンチェーンデータとして扱う
      const dataHash = getHash(data);
      if (
        typeof fragment !== "undefined" &&
        typeof dataHash !== "undefined" &&
        dataHash === lastFragment.header.hash
      ) {
        chainData.value.set(lastFragment.hash, {
          title: fragment.header.title || CONSTS.STR_NA,
          description: fragment.header.description || CONSTS.STR_NA,
          date: lastFragment.timestamp,
          mime: getMimeFromBase64(data),
          base64: data,
        });
      } else {
        settingsStore.logger.debug(
          logTitle,
          "hash incorrect.",
          dataHash,
          lastFragment.header.hash
        );
      }
    }
  }

  // Exports
  return {
    chainData,
    getEBPOnChainData,
  };
});
