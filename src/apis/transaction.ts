import {
  Address,
  TransactionGroup,
  Transaction,
  TransferTransaction,
  PlainMessage,
  AccountInfo,
  Deadline,
  UInt64,
} from "symbol-sdk";
import type { TransactionType, TransactionSearchCriteria } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export async function getTransactionInfo(
  txHash: string
): Promise<Transaction | undefined> {
  if (typeof environmentStore.txRepo === "undefined") {
    return undefined;
  }
  return environmentStore.txRepo
    .getTransaction(txHash, TransactionGroup.Confirmed)
    .toPromise();
}

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
  return getTransactionsOnePage(criteria);
}

async function getTransactionsOnePage(
  criteria: TransactionSearchCriteria
): Promise<Transaction[]> {
  if (typeof environmentStore.txRepo === "undefined") {
    return [];
  }
  const pageTxes = await environmentStore.txRepo.search(criteria).toPromise();
  if (typeof pageTxes === "undefined") {
    return [];
  }
  if (pageTxes.isLastPage) {
    return pageTxes.data;
  }
  criteria.pageNumber =
    typeof criteria.pageNumber === "undefined" ? 2 : criteria.pageNumber + 1;
  return pageTxes.data.concat(await getTransactionsOnePage(criteria));
}

export function createTxTransfer(
  accountInfo: AccountInfo,
  message: string
): TransferTransaction | undefined {
  if (typeof environmentStore.txRepo === "undefined") {
    return undefined;
  }

  return TransferTransaction.create(
    Deadline.create(environmentStore.epochAdjustment),
    accountInfo.address,
    [],
    PlainMessage.create(message),
    environmentStore.networkType
  );
}
