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
const environmentStore = useEnvironmentStore();

export async function getMosaicInfo(
  mosaicIdStr: string
): Promise<MosaicInfo | undefined> {
  if (typeof environmentStore.mosaicRepo === "undefined") {
    return undefined;
  }
  const mosaicId = new MosaicId(mosaicIdStr);
  return environmentStore.mosaicRepo.getMosaic(mosaicId).toPromise();
}

/**
 * モザイク作成の InnerTransaction 作成
 *
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
    Deadline.create(environmentStore.epochAdjustment),
    nonce,
    MosaicId.createFromNonce(nonce, accountInfo.address),
    mosaicFlags,
    0,
    UInt64.fromUint(0),
    environmentStore.networkType
  );

  // モザイク数量設定
  const mosaicChangeTx = MosaicSupplyChangeTransaction.create(
    Deadline.create(environmentStore.epochAdjustment),
    mosaicDefTx.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(amount),
    environmentStore.networkType
  );

  // 2つのトランザクションを InnerTransaction に変換して返却
  return [
    mosaicDefTx.toAggregate(accountInfo.publicAccount),
    mosaicChangeTx.toAggregate(accountInfo.publicAccount),
  ];
}
