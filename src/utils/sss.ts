import type { SSSWindow } from "sss-module";
import type { SignedTransaction, Transaction } from "symbol-sdk";
import CONSTS from "./consts";
declare const window: SSSWindow;

/**
 * SSS Linked
 *
 * @returns true : SSS linked, false : no SSS linked
 */
export function isSSSEnable(): boolean {
  return typeof window.SSS !== "undefined";
}

/**
 * Get SSS Linked ActiveAddress
 *
 * @returns ActiveAddress. If unlinked, return empty string.
 */
export function getAddress(): string {
  return window.SSS?.activeAddress || "";
}

/**
 * Get SSS Linked Account Network Type
 *
 * @returns ActiveNetworkType. If unlinked, return -1.
 */
export function getNetworkType(): number {
  return window.SSS?.activeNetworkType || CONSTS.NETWORKTYPE_INVALID;
}

/**
 * Request Sign to SSS.
 *
 * @param tx target transaction
 * @returns Signed transaction. If unlinked or sign failed, return undefined.
 */
export async function requestTxSign(
  tx: Transaction
): Promise<SignedTransaction | undefined> {
  if (!isSSSEnable()) {
    return undefined;
  }
  window.SSS.setTransaction(tx);
  return await window.SSS.requestSign()
    .then((value) => {
      return value;
    })
    .catch((error) => {
      console.log("SSS Request Sign Error :");
      console.log(error);
      return undefined;
    });
}
