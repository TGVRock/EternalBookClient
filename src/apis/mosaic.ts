import {
  AccountInfo,
  AggregateTransaction,
  Deadline,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicInfo,
  MosaicNonce,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  UInt64,
} from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";
import { AGGREGATE_FEE_MULTIPLIER } from "@/utils/consts";

const environmentStore = useEnvironmentStore();

export async function getMosaicInfo(
  mosaicIdStr: string
): Promise<MosaicInfo | undefined> {
  if (undefined === environmentStore.mosaicRepo) {
    return undefined;
  }
  const mosaicId = new MosaicId(mosaicIdStr);
  return environmentStore.mosaicRepo.getMosaic(mosaicId).toPromise();
}

export function createAggTxMosaicDefine(
  accountInfo: AccountInfo,
  amount: number,
  mosaicFlags: MosaicFlags,
  isMultiSig: boolean
): AggregateTransaction | undefined {
  if (undefined === environmentStore.mosaicRepo) {
    return undefined;
  }

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

  // アグリゲートトランザクションを作成して返却
  if (isMultiSig) {
    // NOTE: マルチシグアカウントで作成するためアグリゲートボンデッド
    return AggregateTransaction.createComplete(
      Deadline.create(environmentStore.epochAdjustment),
      [
        mosaicDefTx.toAggregate(accountInfo.publicAccount),
        mosaicChangeTx.toAggregate(accountInfo.publicAccount),
      ],
      environmentStore.networkType,
      []
    ).setMaxFeeForAggregate(AGGREGATE_FEE_MULTIPLIER, 0);
  } else {
    return AggregateTransaction.createComplete(
      Deadline.create(environmentStore.epochAdjustment),
      [
        mosaicDefTx.toAggregate(accountInfo.publicAccount),
        mosaicChangeTx.toAggregate(accountInfo.publicAccount),
      ],
      environmentStore.networkType,
      []
    ).setMaxFeeForAggregate(AGGREGATE_FEE_MULTIPLIER, 0);
  }
}
