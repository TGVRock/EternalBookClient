import { Address, TransactionGroup, Transaction } from "symbol-sdk";
import type { TransactionType } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export async function getTransactionInfo(
  txHash: string
): Promise<Transaction | undefined> {
  if (undefined === environmentStore.txRepo) {
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
  if (undefined === environmentStore.txRepo) {
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
  if (undefined === pageTxes) {
    return [];
  }
  if (pageTxes.isLastPage) {
    return pageTxes.data;
  }
  return pageTxes.data.concat(
    await getTransactionsOnePage(address, txType, page + 1)
  );
}
