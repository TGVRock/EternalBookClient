import CONSTS from "./consts";
import { ConsoleLogger } from "./consolelogger";
import type { EternalBookProtocolHeader } from "@/models/interfaces/EternalBookProtocolHeader";

/** ロガー */
const logger = new ConsoleLogger();

// FIXME: すべて取得してから表示ではなく、部分部分で取得する方法を検討する

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
