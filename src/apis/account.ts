import { AccountInfo, Address, MultisigAccountInfo } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

// Stores
const envStore = useEnvironmentStore();

/**
 * 有効なアドレスかチェック
 * @param rawAddress アドレス文字列
 * @returns true: 有効, false: 無効
 */
export function isValidAddress(rawAddress: string): boolean {
  return Address.isValidRawAddress(rawAddress);
}

/**
 * アカウント情報の取得
 * @param address 対象アドレス
 * @returns アカウント情報
 */
export async function getAccountInfo(
  address: string
): Promise<AccountInfo | undefined> {
  const logTitle = "get account info:";
  if (typeof envStore.accountRepo === "undefined") {
    envStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (!isValidAddress(address)) {
    envStore.logger.error(logTitle, "invalid address.", address);
    return undefined;
  }
  const rawAddress = Address.createFromRawAddress(address);
  return await envStore.accountRepo.getAccountInfo(rawAddress).toPromise();
}

/**
 * マルチシグアカウント情報の取得
 * @param address 対象アドレス
 * @returns マルチシグアカウント情報
 */
export async function getMultisigInfo(
  address: string
): Promise<MultisigAccountInfo | undefined> {
  const logTitle = "get multisig info:";
  if (typeof envStore.multisigRepo === "undefined") {
    envStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (!isValidAddress(address)) {
    envStore.logger.error(logTitle, "invalid address.", address);
    return undefined;
  }
  // マルチシグアカウント情報の取得
  return await envStore.multisigRepo
    .getMultisigAccountInfo(Address.createFromRawAddress(address))
    .toPromise();
}

/**
 * マルチシグを構成するアドレスの取得
 * @param address 対象アドレス
 * @returns マルチシグアドレスリスト
 */
export async function getMultisigAddresses(
  address: string
): Promise<Address[]> {
  const logTitle = "get multisig addresses:";
  // マルチシグアカウント情報の取得
  const multisigInfo = await getMultisigInfo(address);
  if (typeof multisigInfo === "undefined") {
    envStore.logger.error(logTitle, "get multisig info failed.", address);
    return [];
  }
  // TODO: いったん多重のマルチシグ構成は対象外
  if (multisigInfo.isMultisig()) {
    envStore.logger.debug(logTitle, "address is multisig account.", address);
    return [];
  }
  return multisigInfo.multisigAddresses;
}
