import {
  AccountInfo,
  Address,
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
  type MosaicSearchCriteria,
} from "symbol-sdk";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";
import CONSTS from "@/utils/consts";

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
 * 対象アドレスが作成したモザイク一覧取得
 * @param address アドレス
 * @returns 該当するモザイク一覧
 */
export async function getMosaicsAboutCreatedAddress(
  address: Address
): Promise<MosaicInfo[]> {
  const criteria: MosaicSearchCriteria = {
    ownerAddress: address,
    pageSize: 100,
    pageNumber: 1,
  };
  return await searchMosaics(criteria);
}

/**
 * モザイク検索
 * @param criteria 検索条件
 * @returns 検索条件に一致するモザイク一覧
 */
async function searchMosaics(
  criteria: MosaicSearchCriteria
): Promise<MosaicInfo[]> {
  const logTitle = "search mosaics:";
  settingsStore.logger.debug(
    logTitle,
    "start",
    "page:",
    criteria.pageNumber || CONSTS.STR_NA
  );
  if (typeof chainStore.mosaicRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return [];
  }
  const pageMosaics = await chainStore.mosaicRepo.search(criteria).toPromise();
  if (typeof pageMosaics === "undefined") {
    settingsStore.logger.error(logTitle, "search failed.");
    return [];
  }
  // 最終ページの場合は結果を返却する
  if (pageMosaics.isLastPage) {
    return pageMosaics.data;
  }
  // 再帰実行で次のページを検索し、結果を結合して返却する
  criteria.pageNumber =
    typeof criteria.pageNumber === "undefined" ? 2 : criteria.pageNumber + 1;
  return pageMosaics.data.concat(await searchMosaics(criteria));
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
