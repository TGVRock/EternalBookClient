import {
  Address,
  TransactionGroup,
  Transaction,
  TransferTransaction,
  PlainMessage,
  AccountInfo,
  Deadline,
} from "symbol-sdk";
import type { TransactionType } from "symbol-sdk";
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
  txType: Array<TransactionType>
): Promise<Transaction[]> {
  return getTransactionsOnePage(address, txType, 1);
}

async function getTransactionsOnePage(
  address: Address,
  txType: Array<TransactionType>,
  page: number
): Promise<Transaction[]> {
  if (typeof environmentStore.txRepo === "undefined") {
    return [];
  }
  const pageTxes = await environmentStore.txRepo
    .search({
      type: txType,
      address: address,
      group: TransactionGroup.Confirmed,
      pageSize: 100,
      pageNumber: page,
    })
    .toPromise();
  if (typeof pageTxes === "undefined") {
    return [];
  }
  if (pageTxes.isLastPage) {
    return pageTxes.data;
  }
  return pageTxes.data.concat(
    await getTransactionsOnePage(address, txType, page + 1)
  );
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
