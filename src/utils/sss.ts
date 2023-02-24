import type { SSSWindow } from "sss-module";
import type { NetworkType, SignedTransaction, Transaction } from "symbol-sdk";
declare const window: SSSWindow;

const sss = window.SSS;

/**
 * SSS Linked
 *
 * @returns true : SSS linked, false : no SSS linked
 */
export function isSSSEnable(): boolean {
  return undefined !== sss;
}

/**
 * Get SSS Linked ActiveAddress
 *
 * @returns ActiveAddress
 */
export function getAddress(): string | undefined {
  if (!isSSSEnable()) {
    return undefined;
  }
  return sss.activeAddress;
}

/**
 * Get SSS Linked Account Network Type
 *
 * @returns ActiveNetworkType
 */
export function getNetworkType(): NetworkType | undefined {
  if (!isSSSEnable()) {
    return undefined;
  }
  return sss.activeNetworkType as NetworkType;
}

export async function requestTxSign(
  tx: Transaction
): Promise<SignedTransaction | undefined> {
  if (!isSSSEnable()) {
    return undefined;
  }
  sss.setTransaction(tx);
  return sss.requestSign();
}
