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
import { useEnvironmentStore } from "@/stores/environment";

// Stores
const envStore = useEnvironmentStore();

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
  if (typeof envStore.mosaicRepo === "undefined") {
    envStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (!isValidMosaicId(mosaicIdStr)) {
    envStore.logger.error(logTitle, "invalid mosaic.", mosaicIdStr);
    return undefined;
  }
  const mosaicId = new MosaicId(mosaicIdStr);
  return await envStore.mosaicRepo.getMosaic(mosaicId).toPromise();
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
    Deadline.create(envStore.epochAdjustment),
    nonce,
    MosaicId.createFromNonce(nonce, accountInfo.address),
    mosaicFlags,
    0,
    UInt64.fromUint(0),
    envStore.networkType
  );

  // モザイク数量設定
  const mosaicChangeTx = MosaicSupplyChangeTransaction.create(
    Deadline.create(envStore.epochAdjustment),
    mosaicDefTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(amount),
    envStore.networkType
  );

  // InnerTransaction[] 返却
  return [
    mosaicDefTx.toAggregate(accountInfo.publicAccount),
    mosaicChangeTx.toAggregate(accountInfo.publicAccount),
  ];
}
