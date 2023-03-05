import {
  AggregateTransaction,
  TransactionType,
  TransferTransaction,
  type MosaicInfo,
} from "symbol-sdk";
import { decryptHeader, getHash } from "./crypto";
import { useEnvironmentStore } from "@/stores/environment";
import CONSTS from "./consts";
import { ConsoleLogger } from "./consolelogger";
import { getMimeFromBase64 } from "./mime";
import type { OnChainData } from "@/models/interfaces/OnChainDataModel";
import type { EternalBookProtocolHeader } from "@/models/interfaces/EternalBookProtocolHeader";
import { getTransactionInfo, getTransactions } from "@/apis/transaction";
import { ConvertRealTimestampFromTxTimestamp } from "./converter";

/** ロガー */
const logger = new ConsoleLogger();

// FIXME: すべて取得してから表示ではなく、部分部分で取得する方法を検討する
/**
 * EternalBookProtocol のオンチェーンデータ取得
 * @param mosaicInfo 取得する紐付けモザイクのモザイク情報
 * @returns オンチェーンデータリスト
 */
export async function getEBPOnChainData(
  mosaicInfo: MosaicInfo
): Promise<OnChainData[]> {
  const logTitle = "get EternalBookProtocol data:";
  logger.debug(logTitle, "start");

  // モザイク所有者のアグリゲートTxを全て取得
  const allAggTxes = await getTransactions(
    mosaicInfo.ownerAddress,
    [TransactionType.AGGREGATE_COMPLETE, TransactionType.AGGREGATE_BONDED],
    mosaicInfo.startHeight
  );
  // アグリゲートTxがない場合はオンチェーンデータも存在しないため終了
  if (allAggTxes.length === 0) {
    logger.debug(logTitle, "not exist EternalBookProtocol data");
    return [];
  }

  // EternalBookProtocol のオンチェーンデータを抽出
  const onChainDataAggTxes: Array<{
    header: EternalBookProtocolHeader;
    aggregateTx: AggregateTransaction;
  }> = [];
  // FIXME: Promise.all() 等で非同期で取得するとアクセス過多で429エラーとなるが、処理時間を考えると非同期にしたい
  for (let index = 0; index < allAggTxes.length; index++) {
    // アグリゲートTxのTx情報取得
    // HACK: getTransactions() では InnerTransaction が取得できないため、改めてTx情報取得する
    const aggTx = allAggTxes[index];
    if (
      typeof aggTx.transactionInfo === "undefined" ||
      typeof aggTx.transactionInfo.hash === "undefined"
    ) {
      logger.error(logTitle, "aggregate tx hash undefined.");
      logger.debug(logTitle, "aggregate tx:", aggTx);
      continue;
    }
    const aggTxInfo = (await getTransactionInfo(
      aggTx.transactionInfo.hash
    )) as AggregateTransaction;
    if (typeof aggTxInfo === "undefined") {
      logger.error(
        logTitle,
        "get aggregate tx info failed.",
        aggTx.transactionInfo.hash
      );
      continue;
    }
    // インナーTxが存在しない場合は EternalBookProtocol のオンチェーンデータではない
    if (0 === aggTxInfo.innerTransactions.length) {
      logger.debug(logTitle, "inner tx none.", aggTx.transactionInfo.hash);
      continue;
    }

    // インナーTxがすべてモザイク所有者への転送Txではない場合は無効データ
    const txes = aggTxInfo.innerTransactions.filter(
      (tx) =>
        tx.type === TransactionType.TRANSFER &&
        mosaicInfo.ownerAddress.equals(
          (tx as TransferTransaction).recipientAddress
        )
    );
    if (aggTxInfo.innerTransactions.length !== txes.length) {
      logger.debug(
        logTitle,
        "all inner tx are not transfer.",
        aggTx.transactionInfo.hash
      );
      continue;
    }

    // ヘッダ情報の復号
    const decodedHeader = decryptHeader(
      (aggTxInfo.innerTransactions[CONSTS.TX_HEADER_IDX] as TransferTransaction)
        .message.payload,
      mosaicInfo.id.toHex()
    );
    if (typeof decodedHeader === "undefined") {
      logger.debug(
        logTitle,
        "header decrypt failed.",
        aggTx.transactionInfo.hash
      );
      continue;
    }

    // ヘッダ情報の検証
    // プロトコルバージョン検証
    if (
      decodedHeader.version.substring(0, CONSTS.PROTOCOL_NAME.length) !==
      CONSTS.PROTOCOL_NAME
    ) {
      logger.debug(
        logTitle,
        "header validate:",
        "invalid protocol.",
        aggTx.transactionInfo.hash
      );
      continue;
    }
    // モザイク情報検証
    if (
      mosaicInfo.id.toHex() !== decodedHeader.mosaicId ||
      mosaicInfo.ownerAddress.plain() !== decodedHeader.address
    ) {
      logger.debug(
        logTitle,
        "header validate:",
        "invalid mosaic.",
        aggTx.transactionInfo.hash
      );
      continue;
    }

    // EternalBookProtocol オンチェーンデータであればリスト追加
    onChainDataAggTxes.push({
      header: decodedHeader,
      aggregateTx: aggTxInfo,
    });
  }
  // EternalBookProtocol オンチェーンデータが存在しない場合は終了
  if (0 === onChainDataAggTxes.length) {
    logger.error(logTitle, "not exist on chain data.");
    return [];
  }

  // オンチェーンデータの最終データから遡ってデータを復元する
  const lastDataList = onChainDataAggTxes.filter(
    (aggTx) => "hash" in aggTx.header
  );
  logger.debug(logTitle, "last aggregate tx list:", lastDataList);
  const onChainDataList: Array<OnChainData> = [];
  for (let index = 0; index < lastDataList.length; index++) {
    const lastData = lastDataList[index];
    if (
      typeof lastData.aggregateTx.transactionInfo === "undefined" ||
      typeof lastData.aggregateTx.transactionInfo.timestamp === "undefined"
    ) {
      logger.error(logTitle, "aggregate tx info undefined.");
      logger.debug(logTitle, "aggregate tx:", lastData.aggregateTx);
      continue;
    }

    // Txタイムスタンプから書き込み時刻を取得
    const envStore = useEnvironmentStore();
    const timestamp = ConvertRealTimestampFromTxTimestamp(
      envStore.epochAdjustment,
      lastData.aggregateTx.transactionInfo.timestamp
    );
    const dateTime = new Date(timestamp);

    // 再帰実行によりデータ本体を復元し、ハッシュが一致する場合のみ正しいオンチェーンデータとして扱う
    const data = getOnChainDataFromAggregateTx(onChainDataAggTxes, lastData);
    const hash = getHash(data.data);
    if (typeof hash !== "undefined" && hash === lastData.header.hash) {
      onChainDataList.push({
        title: data.title,
        description: data.description || CONSTS.STR_NA,
        date: dateTime,
        mime: getMimeFromBase64(data.data),
        base64: data.data,
      });
    } else {
      logger.debug(logTitle, "hash incorrect.", lastData.aggregateTx);
    }
  }
  return onChainDataList;
}

// FIXME: わざわざリスト渡しているのはなんとかしたい
// FIXME: interface とかにしたい
/**
 * アグリゲートTxからオンチェーンデータ本体を取得する
 * @param aggTxList アグリゲートTxリスト
 * @param aggTx 取得対象のアグリゲートTx
 * @returns オンチェーンデータ本体
 */
function getOnChainDataFromAggregateTx(
  aggTxList: Array<{
    header: EternalBookProtocolHeader;
    aggregateTx: AggregateTransaction;
  }>,
  aggTx: {
    header: EternalBookProtocolHeader;
    aggregateTx: AggregateTransaction;
  }
): { data: string; title: string; description: string } {
  const logTitle = "get on chain data:";

  // アグリゲートTxに記録されているデータを抽出
  let innerData = "";
  for (
    let idx = CONSTS.TX_DATA_IDX;
    idx < aggTx.aggregateTx.innerTransactions.length;
    idx++
  ) {
    innerData += (
      aggTx.aggregateTx.innerTransactions[idx] as TransferTransaction
    ).message.payload;
  }

  // 先頭データまで到達した場合はデータ返却して終了
  if (null === aggTx.header.prevTx) {
    return {
      data: innerData,
      title: aggTx.header.title || CONSTS.STR_NA,
      description: aggTx.header.description || CONSTS.STR_NA,
    };
  }

  // 直前のアグリゲートTxを検索
  const prevAggTx = aggTxList.filter(
    (tx) =>
      typeof tx.aggregateTx.transactionInfo !== "undefined" &&
      aggTx.header.prevTx === tx.aggregateTx.transactionInfo.hash
  );
  if (0 === prevAggTx.length) {
    // 存在しない場合は復元終了
    logger.debug(logTitle, "not exist prev aggregate tx.");
    return {
      data: innerData,
      title: aggTx.header.title || CONSTS.STR_NA,
      description: aggTx.header.description || CONSTS.STR_NA,
    };
  } else if (1 < prevAggTx.length) {
    // 直前のアグリゲートTxが複数存在する場合(ありえないはず)
    logger.debug(logTitle, "prev aggregate tx duplicate!");
  }
  // 直前のアグリゲートTxに対し再帰実行
  const prevData = getOnChainDataFromAggregateTx(aggTxList, prevAggTx[0]);
  prevData.data += innerData;
  return prevData;
}

/**
 * ヘッダ情報の作成
 * @param mosaicIdStr モザイクID
 * @param ownerAddress 所有者アドレス
 * @param title タイトル
 * @param description 説明
 * @param prevTxHash 前のTxハッシュ
 * @param dataHash データハッシュ
 * @returns EternalBookProtocol ヘッダ情報
 */
export function createHeader(
  mosaicIdStr: string,
  ownerAddress: string,
  title: string,
  description: string,
  prevTxHash?: string,
  dataHash?: string
): EternalBookProtocolHeader {
  // 必須データでヘッダ情報作成
  const txHash: string = prevTxHash || "";
  const header: EternalBookProtocolHeader = {
    version: CONSTS.PROTOCOL_NAME + " " + CONSTS.PROTOCOL_VERSION,
    mosaicId: mosaicIdStr,
    address: ownerAddress,
    prevTx: txHash.length > 0 ? txHash : null,
  };
  // 最初のオンチェーンデータTxのみ存在するプロパティの設定
  if (txHash.length === 0) {
    header.multipul = true;
    header.title = title;
    header.description = description;
  }
  // 最後のオンチェーンデータTxのみ存在するプロパティの設定
  if (typeof dataHash !== "undefined" && dataHash.length > 0) {
    header.hash = dataHash;
  }
  return header;
}
