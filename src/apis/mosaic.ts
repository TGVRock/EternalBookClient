import {
  AccountInfo,
  Deadline,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicInfo,
  MosaicNonce,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  UInt64,
  type InnerTransaction,
} from "symbol-sdk";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();

/**
 * モザイクIDとして有効かチェック
 * @param mosaicIdStr モザイクID文字列(HEX)
 * @returns true: 有効, false: 無効
 */
export function isValidMosaicId(mosaicIdStr: string): boolean {
  // MosaicId オブジェクトを作成し、成功するかどうかで判定する
  try {
    new MosaicId(mosaicIdStr);
  } catch (error) {
    return false;
  }
  return true;
}

/**
 * モザイク情報取得
 * @param mosaicIdStr モザイクID文字列(HEX)
 * @returns モザイク情報
 */
export async function getMosaicInfo(
  mosaicIdStr: string
): Promise<MosaicInfo | undefined> {
  const logTitle = "get mosaic info:";
  if (typeof chainStore.mosaicRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (!isValidMosaicId(mosaicIdStr)) {
    settingsStore.logger.error(logTitle, "invalid mosaic.", mosaicIdStr);
    return undefined;
  }
  const mosaicId = new MosaicId(mosaicIdStr);
  return await chainStore.mosaicRepo.getMosaic(mosaicId).toPromise();
}

/**
 * モザイク作成の InnerTransaction 作成
 * @param accountInfo アカウント情報
 * @param amount 数量
 * @param mosaicFlags モザイクフラグ
 * @returns モザイク作成の InnerTransaction
 */
export function createInnerTxForMosaic(
  accountInfo: AccountInfo,
  amount: number,
  mosaicFlags: MosaicFlags
): Array<InnerTransaction> {
  // モザイク定義
  const nonce = MosaicNonce.createRandom();
  const mosaicDefTx = MosaicDefinitionTransaction.create(
    Deadline.create(chainStore.epochAdjustment),
    nonce,
    MosaicId.createFromNonce(nonce, accountInfo.address),
    mosaicFlags,
    0,
    UInt64.fromUint(0),
    chainStore.networkType
  );

  // モザイク数量設定
  const mosaicChangeTx = MosaicSupplyChangeTransaction.create(
    Deadline.create(chainStore.epochAdjustment),
    mosaicDefTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(amount),
    chainStore.networkType
  );

  // InnerTransaction[] 返却
  return [
    mosaicDefTx.toAggregate(accountInfo.publicAccount),
    mosaicChangeTx.toAggregate(accountInfo.publicAccount),
  ];
}
