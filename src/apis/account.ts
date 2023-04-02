import {
  Account,
  AccountInfo,
  Address,
  Deadline,
  EmptyMessage,
  MultisigAccountInfo,
  NetworkType,
  RepositoryFactoryHttp,
  TransferTransaction,
} from "symbol-sdk";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";
import CONSTS from "@/utils/consts";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();

/**
 * 有効なアドレスかチェック
 * @param rawAddress アドレス文字列
 * @returns true: 有効, false: 無効
 */
export function isValidAddress(rawAddress: string): boolean {
  return Address.isValidRawAddress(rawAddress);
}

/**
 * 秘密鍵からアカウントを作成する
 * @param privateKey 秘密鍵
 * @param netType ネットワークタイプ
 * @returns アカウント
 */
export function createAccountFromPrivateKey(
  privateKey: string,
  netType: NetworkType
): Account | undefined {
  try {
    return Account.createFromPrivateKey(privateKey, netType);
  } catch (error) {
    /* empty */
  }
  return undefined;
}

/**
 * テストネットのアカウント情報の取得
 * @param address 対象アドレス
 * @returns アカウント情報
 */
export async function getTestAccountInfo(
  address: string
): Promise<AccountInfo | undefined> {
  const logTitle = "get test account info:";
  const repo = new RepositoryFactoryHttp(chainStore.getTestNetNode());
  const accountRepo = repo.createAccountRepository();
  if (!isValidAddress(address)) {
    settingsStore.logger.error(logTitle, "invalid address.", address);
    return undefined;
  }
  const rawAddress = Address.createFromRawAddress(address);
  return await accountRepo
    .getAccountInfo(rawAddress)
    .toPromise()
    .then((value) => {
      return value;
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "failed.", error);
      return undefined;
    });
}

/**
 * テストアカウントの公開鍵アナウンス
 * @param account 対象アカウント
 * @returns 処理結果
 */
export async function announceTestAccountPublicKey(
  account: Account
): Promise<boolean> {
  const logTitle = "announce test account public key:";
  const repo = new RepositoryFactoryHttp(chainStore.getTestNetNode());
  const txRepo = repo.createTransactionRepository();

  // アカウントのネットワークタイプがテストネットではない場合は終了
  if (account.networkType !== NetworkType.TEST_NET) {
    settingsStore.logger.error(logTitle, "not testnet account.");
    return false;
  }

  // generationHash, epochAdjustment の取得
  const generationHash = await repo
    .getGenerationHash()
    .toPromise()
    .then((value) => {
      return value;
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "failed.", error);
      return undefined;
    });
  if (typeof generationHash === "undefined") {
    settingsStore.logger.error(logTitle, "get generationHash failed.");
    return false;
  }
  const epochAdjustment = await repo
    .getEpochAdjustment()
    .toPromise()
    .then((value) => {
      return value;
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "failed.", error);
      return undefined;
    });
  if (typeof epochAdjustment === "undefined") {
    settingsStore.logger.error(logTitle, "get epochAdjustment failed.");
    return false;
  }

  // 自身への転送Txを作成してアナウンス
  const tx = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    account.address,
    [],
    EmptyMessage,
    NetworkType.TEST_NET
  ).setMaxFee(CONSTS.TX_FEE_MULTIPLIER_DEFAULT);
  const signedTx = account.sign(tx, generationHash);
  settingsStore.logger.debug(logTitle, "now announce.", signedTx);
  return txRepo
    .announce(signedTx)
    .toPromise()
    .then((value) => {
      settingsStore.logger.debug(logTitle, "announced.", value);
      if (typeof value === "undefined") {
        settingsStore.logger.error(logTitle, "announce failed.");
        return false;
      }
      return true;
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "failed.", error);
      return false;
    });
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
  if (typeof chainStore.accountRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (!isValidAddress(address)) {
    settingsStore.logger.error(logTitle, "invalid address.", address);
    return undefined;
  }
  const rawAddress = Address.createFromRawAddress(address);
  return await chainStore.accountRepo
    .getAccountInfo(rawAddress)
    .toPromise()
    .then((value) => {
      return value;
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "failed.", error);
      return undefined;
    });
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
  if (typeof chainStore.multisigRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (!isValidAddress(address)) {
    settingsStore.logger.error(logTitle, "invalid address.", address);
    return undefined;
  }
  // マルチシグアカウント情報の取得
  return await chainStore.multisigRepo
    .getMultisigAccountInfo(Address.createFromRawAddress(address))
    .toPromise()
    .then((value) => {
      return value;
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "failed.", error);
      return undefined;
    });
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
    settingsStore.logger.error(logTitle, "get multisig info failed.", address);
    return [];
  }
  // TODO: いったん多重のマルチシグ構成は対象外
  if (multisigInfo.isMultisig()) {
    settingsStore.logger.debug(
      logTitle,
      "address is multisig account.",
      address
    );
    return [];
  }
  return multisigInfo.multisigAddresses;
}
