import type { OnChainData } from "@/models/OnChainDataModel";
import {
  AggregateTransaction,
  TransactionType,
  TransferTransaction,
  type MosaicInfo,
} from "symbol-sdk";
import { getTransactionInfo, getTransactions } from "@/apis/transaction";
import { decryptoHeader, getHash } from "./crypto";
import CONSTS from "./consts";
import type { EternalBookProtocolHeader } from "@/models/EternalBookProtocolHeader";
import { useEnvironmentStore } from "@/stores/environment";
import { getMimeFromBase64 } from "./mime";

const environmentStore = useEnvironmentStore();

export async function getEBPOnChainData(
  mosaicInfo: MosaicInfo
): Promise<OnChainData[]> {
  // アカウントのアグリゲートトランザクションを全て取得
  const allAggTxes = await getTransactions(
    mosaicInfo.ownerAddress,
    [TransactionType.AGGREGATE_COMPLETE, TransactionType.AGGREGATE_BONDED],
    mosaicInfo.startHeight
  );
  // オンチェーンデータアグリゲートが存在しない場合は終了
  if (0 === allAggTxes.length) {
    return [];
  }

  const onChainDataAggTxes: Array<{
    header: EternalBookProtocolHeader;
    aggregateTx: AggregateTransaction;
  }> = [];
  for (let index = 0; index < allAggTxes.length; index++) {
    const aggTx = allAggTxes[index];
    if (
      typeof aggTx.transactionInfo === "undefined" ||
      typeof aggTx.transactionInfo.hash === "undefined"
    ) {
      continue;
    }

    const aggTxInfo = (await getTransactionInfo(
      aggTx.transactionInfo.hash
    )) as AggregateTransaction;
    if (typeof aggTxInfo === "undefined") {
      continue;
    }
    // アグリゲート内にトランザクションが存在しない場合は無効データ
    if (0 === aggTxInfo.innerTransactions.length) {
      continue;
    }

    // アグリゲート内の全てのトランザクションがモザイク所有者への転送トランザクションではない場合は無効データ
    const txes = aggTxInfo.innerTransactions.filter(
      (tx) =>
        tx.type === TransactionType.TRANSFER &&
        mosaicInfo.ownerAddress.equals(
          (tx as TransferTransaction).recipientAddress
        )
    );
    if (aggTxInfo.innerTransactions.length !== txes.length) {
      continue;
    }

    // ヘッダ復号
    const dataHeader = decryptoHeader(
      mosaicInfo.id.toHex(),
      (aggTxInfo.innerTransactions[CONSTS.TX_HEADER_IDX] as TransferTransaction)
        .message.payload
    );
    if (typeof dataHeader === "undefined") {
      continue;
    }
    // ヘッダ検証
    if (
      CONSTS.PROTOCOL_NAME !==
      dataHeader.version.substring(0, CONSTS.PROTOCOL_NAME.length)
    ) {
      // プロトコル不一致
      continue;
    }
    if (
      mosaicInfo.id.toHex() !== dataHeader.mosaicId ||
      mosaicInfo.ownerAddress.plain() !== dataHeader.address
    ) {
      // モザイク情報不一致
      continue;
    }

    onChainDataAggTxes.push({
      header: dataHeader,
      aggregateTx: aggTxInfo,
    });
  }
  // オンチェーンデータアグリゲートが存在しない場合は終了
  if (0 === onChainDataAggTxes.length) {
    return [];
  }

  // オンチェーンデータの最終データを集める
  const lastDataList = onChainDataAggTxes.filter(
    (aggTx) => "hash" in aggTx.header
  );

  const onChainDataList: Array<OnChainData> = [];
  for (let index = 0; index < lastDataList.length; index++) {
    const lastData = lastDataList[index];
    if (
      typeof lastData.aggregateTx.transactionInfo === "undefined" ||
      typeof lastData.aggregateTx.transactionInfo.timestamp === "undefined"
    ) {
      continue;
    }

    const verifyHash = lastData.header.hash;
    const timestamp =
      environmentStore.epochAdjustment * 1000 +
      Number(lastData.aggregateTx.transactionInfo.timestamp.toString());
    const dateTime = new Date(timestamp);

    // 末尾のデータから遡ってオンチェーンデータを復元
    const data = getAggregateTxData(onChainDataAggTxes, lastData);

    // 復元したデータのハッシュとトランザクションに保持しているハッシュを検証
    const hash = getHash(data.data);
    if (hash === verifyHash) {
      // ハッシュが一致する場合のみ正しいオンチェーンデータとして扱う
      onChainDataList.push({
        title: data.title,
        description: data.description || CONSTS.STR_NA,
        date: dateTime,
        mime: getMimeFromBase64(data.data),
        base64: data.data,
      });
    }
  }

  return onChainDataList;
}

function getAggregateTxData(
  aggTxList: Array<{
    header: EternalBookProtocolHeader;
    aggregateTx: AggregateTransaction;
  }>,
  aggTx: {
    header: EternalBookProtocolHeader;
    aggregateTx: AggregateTransaction;
  }
): { data: string; title: string; description: string } {
  // 1つのアグリゲートに記録されているデータを抽出
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

  // 先頭データの場合は終了
  if (null === aggTx.header.prevTx) {
    return {
      data: innerData,
      title: aggTx.header.title || CONSTS.STR_NA,
      description: aggTx.header.description || CONSTS.STR_NA,
    };
  }

  // 1つ前のアグリゲートトランザクションを検索
  const prevAggTx = aggTxList.filter(
    (tx) =>
      typeof tx.aggregateTx.transactionInfo !== "undefined" &&
      aggTx.header.prevTx === tx.aggregateTx.transactionInfo.hash
  );
  if (0 === prevAggTx.length) {
    // 存在しない場合は復元終了
    return {
      data: innerData,
      title: aggTx.header.title || CONSTS.STR_NA,
      description: aggTx.header.description || CONSTS.STR_NA,
    };
  } else if (1 < prevAggTx.length) {
    // ありえないはずのため、ログ出力のみ
    console.log("transaction duplicated!");
  }
  const prevData = getAggregateTxData(aggTxList, prevAggTx[0]);
  prevData.data += innerData;
  return prevData;
}

export function createHeader(
  mosaicIdStr: string,
  ownerAddress: string,
  prevTx: string,
  title: string,
  description: string,
  hash: string
): EternalBookProtocolHeader {
  const header: EternalBookProtocolHeader = {
    version: CONSTS.PROTOCOL_NAME + " " + CONSTS.PROTOCOL_VERSION,
    mosaicId: mosaicIdStr,
    address: ownerAddress,
    prevTx: prevTx.length > 0 ? prevTx : null,
  };
  if (prevTx.length === 0) {
    header.multipul = true;
    header.title = title;
    header.description = description;
  }
  if (hash.length > 0) {
    header.hash = hash;
  }
  return header;
}
