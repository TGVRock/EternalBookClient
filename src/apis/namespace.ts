import { MosaicId } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";
import { isValidMosaicId } from "./mosaic";

// Stores
const envStore = useEnvironmentStore();

/**
 * モザイクエイリアス取得
 * @param mosaicIdStr モザイクID文字列
 * @returns モザイクエイリアス
 */
export async function getMosaicName(
  mosaicIdStr: string
): Promise<string | undefined> {
  const logTitle = "get mosaic name:";
  if (typeof envStore.namespaceRepo === "undefined") {
    envStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (!isValidMosaicId(mosaicIdStr)) {
    envStore.logger.error(logTitle, "invalid mosaic.", mosaicIdStr);
    return undefined;
  }
  const mosaicId = new MosaicId(mosaicIdStr);
  const allMosaicNames = await envStore.namespaceRepo
    .getMosaicsNames([mosaicId])
    .toPromise();
  if (typeof allMosaicNames === "undefined") {
    envStore.logger.error(logTitle, "get name failed.", mosaicIdStr);
    return undefined;
  }
  const mosaicNames = allMosaicNames.find(
    (name) => name.mosaicId.toHex() === mosaicIdStr
  );
  if (typeof mosaicNames === "undefined" || mosaicNames.names.length === 0) {
    envStore.logger.error(logTitle, "not exist mosaic.", mosaicIdStr);
    return undefined;
  }
  return mosaicNames.names[0].name;
}
