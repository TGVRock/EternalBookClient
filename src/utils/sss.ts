import type { SignedTransaction, Transaction } from "symbol-sdk";
import type { SSSWindow } from "sss-module";
import CONSTS from "./consts";
import { ConsoleLogger } from "./consolelogger";
declare const window: SSSWindow;

/** ロガー */
const logger = new ConsoleLogger();

/**
 * SSS Linked
 * @returns true : SSS linked, false : no SSS linked
 */
export function isSSSEnable(): boolean {
  return typeof window.SSS !== "undefined";
}

/**
 * Get SSS Linked ActiveAddress
 * @returns ActiveAddress. If unlinked, return empty string.
 */
export function getAddress(): string {
  return window.SSS?.activeAddress || "";
}

/**
 * Get SSS Linked Account Network Type
 * @returns ActiveNetworkType. If unlinked, return -1.
 */
export function getNetworkType(): number {
  return window.SSS?.activeNetworkType || CONSTS.NETWORKTYPE_INVALID;
}

/**
 * Request Sign to SSS.
 * @param tx target transaction
 * @returns Signed transaction. If unlinked or sign failed, return undefined.
 */
export async function requestTxSign(
  tx: Transaction
): Promise<SignedTransaction | undefined> {
  if (!isSSSEnable()) {
    logger.error("sss:", "not enables.");
    return undefined;
  }
  window.SSS.setTransaction(tx);
  return await window.SSS.requestSign()
    .then((value) => {
      logger.debug("sss:", "request sign success.", value);
      return value;
    })
    .catch((error) => {
      // TODO: SSSウィンドウが表示されない場合の対処
      logger.error("sss:", "request sign failed.", error);
      return undefined;
    });
}
