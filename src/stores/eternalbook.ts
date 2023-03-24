import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { TransactionType } from "symbol-sdk";
import type {
  NetworkType,
  AggregateTransaction,
  Transaction,
  TransferTransaction,
  MosaicInfo,
} from "symbol-sdk";
import { useSettingsStore } from "./settings";
import { useChainStore } from "./chain";
import type { EternalBookProtocolHeader } from "@/models/interfaces/EternalBookProtocolHeader";
import type { OnChainData } from "@/models/interfaces/OnChainDataModel";
import { getTransactionInfo, getTransactions } from "@/apis/transaction";
import CONSTS from "@/utils/consts";
import { ConvertRealTimestampFromTxTimestamp } from "@/utils/converter";
import { decryptHeader, getHash } from "@/utils/crypto";
import { getMimeFromBase64 } from "@/utils/mime";

/**
 * オンチェーンデータ情報ストア
 */
export const useEternalBookStore = defineStore("eternalbook", () => {
  // Other Stores
  const settingsStore = useSettingsStore();
  const chainStore = useChainStore();

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

    function isInnnerTxValid(aggTx: AggregateTransaction): boolean {
      // インナーTxが存在しない場合は EternalBookProtocol のオンチェーンデータではない
      if (aggTx.innerTransactions.length === 0) {
        settingsStore.logger.debug(
          logTitle,
          "inner tx none.",
          aggTx.transactionInfo?.hash
        );
        return false;
      }
      // インナーTxがすべてモザイク作成者への転送Txではない場合は無効データ
      const selfTransferTxes = aggTx.innerTransactions.filter(
        (tx) =>
          tx.type === TransactionType.TRANSFER &&
          mosaicInfo.ownerAddress.equals(
            (tx as TransferTransaction).recipientAddress
          )
      );
      if (aggTx.innerTransactions.length !== selfTransferTxes.length) {
        settingsStore.logger.debug(
          logTitle,
          "all inner tx are not transfer.",
          aggTx.transactionInfo?.hash
        );
        return false;
      }
      return true;
    }

    function isHeaderValid(header: EternalBookProtocolHeader): boolean {
      // プロトコル名検証
      if (
        header.version.substring(0, CONSTS.PROTOCOL_NAME.length) !==
        CONSTS.PROTOCOL_NAME
      ) {
        settingsStore.logger.debug(
          logTitle,
          "header validate:",
          "invalid protocol.",
          header
        );
        return false;
      }
      // モザイク情報検証
      if (
        mosaicInfo.id.toHex() !== header.mosaicId ||
        mosaicInfo.ownerAddress.plain() !== header.address
      ) {
        settingsStore.logger.debug(
          logTitle,
          "header validate:",
          "invalid mosaic.",
          header
        );
        return false;
      }
      return true;
    }

    async function getDataFragment(aggTx: Transaction) {
      // search() では InnerTransaction が取得できないためTx情報を取得する
      const aggTxInfo = (await getTransactionInfo(
        aggTx.transactionInfo?.hash!
      )) as AggregateTransaction;
      if (typeof aggTxInfo?.transactionInfo?.hash === "undefined") {
        settingsStore.logger.error(
          logTitle,
          "aggregate tx info hash undefined."
        );
        settingsStore.logger.debug(logTitle, "aggregate tx:", aggTx);
        return undefined;
      }
      // InnerTransaction チェック
      if (!isInnnerTxValid(aggTxInfo)) {
        settingsStore.logger.error(logTitle, "aggregate tx inner invalid.");
        settingsStore.logger.debug(logTitle, "aggregate tx:", aggTx);
        return undefined;
      }

      // ヘッダ情報の復号
      const decodedHeader = decryptHeader(
        (
          aggTxInfo.innerTransactions[
            CONSTS.TX_HEADER_IDX
          ] as TransferTransaction
        ).message.payload,
        mosaicInfo.id.toHex()
      );
      if (typeof decodedHeader === "undefined") {
        settingsStore.logger.debug(
          logTitle,
          "header decrypt failed.",
          aggTx.transactionInfo?.hash
        );
        return undefined;
      }
      // ヘッダ情報チェック
      if (!isHeaderValid(decodedHeader)) {
        settingsStore.logger.error(logTitle, "aggregate tx header invalid.");
        settingsStore.logger.debug(logTitle, "aggregate tx:", aggTx);
        return undefined;
      }

      // Txタイムスタンプから書き込み時刻を取得
      if (typeof aggTx.transactionInfo?.timestamp === "undefined") {
        settingsStore.logger.debug(
          logTitle,
          "aggregate tx info timestamp undefined."
        );
        return undefined;
      }
      const chainStore = useChainStore();
      const timestamp = ConvertRealTimestampFromTxTimestamp(
        chainStore.epochAdjustment,
        aggTx.transactionInfo.timestamp
      );
      const dateTime = new Date(timestamp);

      // アグリゲートTxに記録されているデータを抽出
      let innerData = "";
      for (
        let idx = CONSTS.TX_DATA_IDX;
        idx < aggTxInfo.innerTransactions.length;
        idx++
      ) {
        innerData += (aggTxInfo.innerTransactions[idx] as TransferTransaction)
          .message.payload;
      }

      // リスト追加
      return {
        hash: aggTx.transactionInfo!.hash!,
        timestamp: dateTime,
        header: decodedHeader,
        data: innerData,
      };
    }

    interface Fragment {
      hash: string;
      timestamp: Date;
      header: EternalBookProtocolHeader;
      data: string;
    }

    // 末尾から探索するため反転
    while (allAggTxes.length > 0) {
      console.log(allAggTxes.length);
      // 最新Txの取得
      const aggTx = allAggTxes.pop();
      if (typeof aggTx?.transactionInfo?.hash === "undefined") {
        settingsStore.logger.error(logTitle, "aggregate tx hash undefined.");
        settingsStore.logger.debug(logTitle, "aggregate tx:", aggTx);
        continue;
      }

      // データフラグメントの取得
      const lastFragment = await getDataFragment(aggTx);
      if (typeof lastFragment === "undefined") {
        settingsStore.logger.error(logTitle, "fragment undefined.");
        settingsStore.logger.debug(logTitle, "aggregate tx:", aggTx);
        continue;
      }

      // Txをさかのぼってデータを復元
      let fragment: Fragment | undefined = undefined;
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
        fragment = await getDataFragment(prevAggTx);
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
