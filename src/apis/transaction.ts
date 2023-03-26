import {
  Address,
  TransactionGroup,
  Transaction,
  TransferTransaction,
  PlainMessage,
  AccountInfo,
  Deadline,
  UInt64,
  AggregateTransaction,
  type InnerTransaction,
  TransactionType,
  type TransactionSearchCriteria,
  HashLockTransaction,
  Mosaic,
  NamespaceId,
  SignedTransaction,
  RawMessage,
  TransactionAnnounceResponse,
} from "symbol-sdk";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";
import CONSTS from "@/utils/consts";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();

/**
 * Txアナウンス
 * @param signedTx 署名済Tx
 * @returns レスポンス
 */
export async function announceTx(
  signedTx: SignedTransaction
): Promise<TransactionAnnounceResponse | undefined> {
  const logTitle = "announce tx:";
  if (typeof chainStore.txRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (signedTx.type === TransactionType.AGGREGATE_BONDED) {
    return await chainStore.txRepo
      .announceAggregateBonded(signedTx)
      .toPromise();
  }
  return await chainStore.txRepo.announce(signedTx).toPromise();
}

/**
 * Tx情報取得
 * @param txHash Txハッシュ
 * @returns Tx情報
 */
export async function getTransactionInfo(
  txHash: string
): Promise<Transaction | undefined> {
  const logTitle = "get tx info:";
  if (typeof chainStore.txRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  return await chainStore.txRepo
    .getTransaction(txHash, TransactionGroup.Confirmed)
    .toPromise();
}

/**
 * 対象アドレスのTx一覧取得
 * @param address アドレス
 * @param txType Txタイプ
 * @param fromHeight 始点のブロック高(省略可能)
 * @returns 該当するTx一覧
 */
export async function getTransactions(
  address: Address,
  txType: Array<TransactionType>,
  fromHeight?: UInt64
): Promise<Transaction[]> {
  const criteria: TransactionSearchCriteria = {
    type: txType,
    address: address,
    group: TransactionGroup.Confirmed,
    pageSize: 100,
    pageNumber: 1,
  };
  if (typeof fromHeight != "undefined") {
    criteria.fromHeight = fromHeight;
  }
  return await searchTransactions(criteria);
}

/**
 * Tx検索
 * @param criteria 検索条件
 * @returns 検索条件に一致するTx一覧
 */
async function searchTransactions(
  criteria: TransactionSearchCriteria
): Promise<Transaction[]> {
  const logTitle = "search txes:";
  settingsStore.logger.debug(
    logTitle,
    "start",
    "page:",
    criteria.pageNumber || CONSTS.STR_NA
  );
  if (typeof chainStore.txRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return [];
  }
  const pageTxes = await chainStore.txRepo.search(criteria).toPromise();
  if (typeof pageTxes === "undefined") {
    settingsStore.logger.error(logTitle, "search failed.");
    return [];
  }
  // 最終ページの場合は結果を返却する
  if (pageTxes.isLastPage) {
    return pageTxes.data;
  }
  // 再帰実行で次のページを検索し、結果を結合して返却する
  criteria.pageNumber =
    typeof criteria.pageNumber === "undefined" ? 2 : criteria.pageNumber + 1;
  return pageTxes.data.concat(await searchTransactions(criteria));
}

/**
 * 平文メッセージ転送Tx作成
 * @param accountInfo アカウント情報
 * @param message 転送する平文メッセージ
 * @returns 転送Tx
 */
export function createTxTransferPlainMessage(
  accountInfo: AccountInfo,
  message: string
): TransferTransaction {
  return TransferTransaction.create(
    Deadline.create(chainStore.epochAdjustment),
    accountInfo.address,
    [],
    PlainMessage.create(message),
    chainStore.networkType
  );
}

/**
 * データ転送Tx作成
 * @param accountInfo アカウント情報
 * @param data 転送するデータ
 * @returns 転送Tx
 */
export function createTxTransferData(
  accountInfo: AccountInfo,
  data: Uint8Array
): TransferTransaction {
  return TransferTransaction.create(
    Deadline.create(chainStore.epochAdjustment),
    accountInfo.address,
    [],
    RawMessage.create(data),
    chainStore.networkType
  );
}

/**
 * ハッシュロックTx作成
 * @param signedTx 署名済Tx
 * @param fee 手数料乗数
 * @returns ハッシュロックTx
 */
export function createTxHashLock(
  signedTx: SignedTransaction,
  fee: number = CONSTS.TX_FEE_MULTIPLIER_DEFAULT
): HashLockTransaction {
  return HashLockTransaction.create(
    Deadline.create(chainStore.epochAdjustment),
    new Mosaic(
      new NamespaceId(CONSTS.TX_XYM_ALIAS),
      UInt64.fromUint(CONSTS.TX_HASHLOCK_COST)
    ),
    UInt64.fromUint(480),
    signedTx,
    chainStore.networkType
  ).setMaxFee(fee) as HashLockTransaction;
}

/**
 * アグリゲートボンデッドTx作成
 * @param txList インナーTxリスト
 * @param fee 手数料乗数
 * @returns アグリゲートボンデッドTx
 */
export function createTxAggregateBonded(
  txList: InnerTransaction[],
  fee: number = CONSTS.TX_FEE_MULTIPLIER_DEFAULT
): AggregateTransaction {
  return AggregateTransaction.createBonded(
    Deadline.create(chainStore.epochAdjustment),
    txList,
    chainStore.networkType,
    []
  ).setMaxFeeForAggregate(fee, 0);
}

/**
 * アグリゲートコンプリートTx作成
 * @param txList インナーTxリスト
 * @param fee 手数料乗数
 * @returns アグリゲートコンプリートTx
 */
export function createTxAggregateComplete(
  txList: InnerTransaction[],
  fee: number | undefined = CONSTS.TX_FEE_MULTIPLIER_DEFAULT
): AggregateTransaction {
  return AggregateTransaction.createComplete(
    Deadline.create(chainStore.epochAdjustment),
    txList,
    chainStore.networkType,
    []
  ).setMaxFeeForAggregate(fee, 0);
}
