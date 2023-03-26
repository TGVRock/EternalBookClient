import {
  Address,
  MosaicInfo,
  Transaction,
  TransactionType,
  TransferTransaction,
  type AggregateTransaction,
} from "symbol-sdk";
import CONSTS from "./consts";
import { ConsoleLogger } from "./consolelogger";
import { ConvertRealTimestampFromTxTimestamp } from "./converter";
import { decryptHeader } from "./crypto";
import type { EternalBookProtocolHeader } from "@/models/interfaces/EternalBookProtocolHeader";
import { getTransactionInfo } from "@/apis/transaction";
import { useChainStore } from "@/stores/chain";

/** ロガー */
const logger = new ConsoleLogger();

/**
 * ヘッダ情報の作成
 * @param mosaicIdStr モザイクID
 * @param ownerAddress 作成者アドレス
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

/**
 * インナーTxの検証
 * @param aggTx 検査するアグリゲートTx
 * @param ownerAddress モザイク作成者アドレス
 * @returns 検証結果
 */
function isInnnerTxValid(
  aggTx: AggregateTransaction,
  ownerAddress: Address
): boolean {
  const logTitle = "validate inner tx:";
  // インナーTxが存在しない場合は EternalBookProtocol のオンチェーンデータではない
  if (aggTx.innerTransactions.length === 0) {
    logger.debug(logTitle, "inner tx none.", aggTx.transactionInfo);
    return false;
  }
  // インナーTxがすべてモザイク作成者への転送Txではない場合は無効データ
  const selfTransferTxes = aggTx.innerTransactions.filter(
    (tx) =>
      tx.type === TransactionType.TRANSFER &&
      ownerAddress.equals((tx as TransferTransaction).recipientAddress)
  );
  if (aggTx.innerTransactions.length !== selfTransferTxes.length) {
    logger.debug(logTitle, "exist not transfer.", aggTx.transactionInfo);
    return false;
  }
  return true;
}

/**
 * ヘッダ情報の検証
 * @param header ヘッダ情報
 * @param mosaicInfo モザイク情報
 * @returns 検証結果
 */
function isHeaderValid(
  header: EternalBookProtocolHeader,
  mosaicInfo: MosaicInfo
): boolean {
  const logTitle = "validate protocol header:";
  // プロトコル名検証
  if (
    header.version.substring(0, CONSTS.PROTOCOL_NAME.length) !==
    CONSTS.PROTOCOL_NAME
  ) {
    logger.debug(logTitle, "invalid protocol.", header);
    return false;
  }
  // モザイク情報検証
  if (
    mosaicInfo.id.toHex() !== header.mosaicId ||
    mosaicInfo.ownerAddress.plain() !== header.address
  ) {
    logger.debug(logTitle, "invalid mosaic.", header);
    return false;
  }
  return true;
}

/**
 * データフラグメントの取得
 * @param aggTx Tx
 * @param mosaicInfo モザイク情報
 * @returns データフラグメント
 */
export async function getDataFragment(
  aggTx: Transaction,
  mosaicInfo: MosaicInfo
) {
  const logTitle = "get fragment:";
  if (typeof aggTx?.transactionInfo?.hash === "undefined") {
    logger.debug(logTitle, "tx hash undefined.", aggTx);
    return undefined;
  }

  // search() では InnerTransaction が取得できないためTx情報を取得する
  const txInfo = await getTransactionInfo(aggTx.transactionInfo.hash);
  if (typeof txInfo?.transactionInfo?.hash === "undefined") {
    logger.debug(logTitle, "tx info hash undefined.", aggTx);
    return undefined;
  }
  // Txタイプを確認
  if (
    txInfo.type !== TransactionType.AGGREGATE_COMPLETE &&
    txInfo.type !== TransactionType.AGGREGATE_BONDED
  ) {
    logger.debug(logTitle, "tx is not aggregate.", aggTx);
    return undefined;
  }
  const aggTxInfo = txInfo as AggregateTransaction;

  // InnerTransaction チェック
  if (!isInnnerTxValid(aggTxInfo, mosaicInfo.ownerAddress)) {
    logger.debug(logTitle, "aggregate tx inner invalid.", aggTxInfo);
    return undefined;
  }

  // ヘッダ情報の復号
  const decodedHeader = decryptHeader(
    (aggTxInfo.innerTransactions[CONSTS.TX_HEADER_IDX] as TransferTransaction)
      .message.payload,
    mosaicInfo.id.toHex()
  );
  if (typeof decodedHeader === "undefined") {
    logger.debug(logTitle, "header decrypt failed.", aggTxInfo.transactionInfo);
    return undefined;
  }
  // ヘッダ情報チェック
  if (!isHeaderValid(decodedHeader, mosaicInfo)) {
    logger.debug(logTitle, "aggregate tx header invalid.", aggTx);
    return undefined;
  }

  // Txタイムスタンプから書き込み時刻を取得
  if (typeof aggTx.transactionInfo?.timestamp === "undefined") {
    logger.debug(logTitle, "aggregate tx info timestamp undefined.");
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
