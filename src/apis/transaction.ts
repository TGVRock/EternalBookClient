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
  type TransactionType,
  type TransactionSearchCriteria,
  HashLockTransaction,
  Mosaic,
  NamespaceId,
  SignedTransaction,
  RawMessage,
} from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";
import CONSTS from "@/utils/consts";

// Stores
const envStore = useEnvironmentStore();

/**
 * Tx情報取得
 * @param txHash Txハッシュ
 * @returns Tx情報
 */
export async function getTransactionInfo(
  txHash: string
): Promise<Transaction | undefined> {
  const logTitle = "get tx info:";
  if (typeof envStore.txRepo === "undefined") {
    envStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  return await envStore.txRepo
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
  return searchTransactions(criteria);
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
  envStore.logger.debug(
    logTitle,
    "start",
    "page:",
    criteria.pageNumber || CONSTS.STR_NA
  );
  if (typeof envStore.txRepo === "undefined") {
    envStore.logger.error(logTitle, "repository undefined.");
    return [];
  }
  const pageTxes = await envStore.txRepo.search(criteria).toPromise();
  if (typeof pageTxes === "undefined") {
    envStore.logger.error(logTitle, "search failed.");
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
    Deadline.create(envStore.epochAdjustment),
    accountInfo.address,
    [],
    PlainMessage.create(message),
    envStore.networkType
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
    Deadline.create(envStore.epochAdjustment),
    accountInfo.address,
    [],
    RawMessage.create(data),
    envStore.networkType
  );
}

/**
 * ハッシュロックTx作成
 * @param signedTx 署名済Tx
 * @returns ハッシュロックTx
 */
export function createTxHashLock(
  signedTx: SignedTransaction
): HashLockTransaction {
  const hashLockTx = HashLockTransaction.create(
    Deadline.create(envStore.epochAdjustment),
    new Mosaic(
      new NamespaceId(CONSTS.TX_XYM_ALIAS),
      UInt64.fromUint(CONSTS.TX_HASHLOCK_COST)
    ),
    UInt64.fromUint(480),
    signedTx,
    envStore.networkType
  ).setMaxFee(CONSTS.TX_FEE_MULTIPLIER_DEFAULT) as HashLockTransaction;
  hashLockTx.setMaxFee(CONSTS.TX_FEE_MULTIPLIER_DEFAULT);
  return hashLockTx;
}

/**
 * アグリゲートボンデッドTx作成
 * @param txList インナーTxリスト
 * @returns アグリゲートボンデッドTx
 */
export function createTxAggregateBonded(
  txList: InnerTransaction[]
): AggregateTransaction {
  return AggregateTransaction.createBonded(
    Deadline.create(envStore.epochAdjustment),
    txList,
    envStore.networkType,
    []
  ).setMaxFeeForAggregate(CONSTS.TX_FEE_MULTIPLIER_DEFAULT, 0);
}

/**
 * アグリゲートコンプリートTx作成
 * @param txList インナーTxリスト
 * @returns アグリゲートコンプリートTx
 */
export function createTxAggregateComplete(
  txList: InnerTransaction[]
): AggregateTransaction {
  return AggregateTransaction.createComplete(
    Deadline.create(envStore.epochAdjustment),
    txList,
    envStore.networkType,
    []
  ).setMaxFeeForAggregate(CONSTS.TX_FEE_MULTIPLIER_DEFAULT, 0);
}
