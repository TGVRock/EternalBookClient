import { MosaicId } from "symbol-sdk";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";
import { isValidMosaicId } from "./mosaic";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();

/**
 * モザイクエイリアス取得
 * @param mosaicIdStr モザイクID文字列
 * @returns モザイクエイリアス
 */
export async function getMosaicName(
  mosaicIdStr: string
): Promise<string | undefined> {
  const logTitle = "get mosaic name:";
  if (typeof chainStore.namespaceRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  if (!isValidMosaicId(mosaicIdStr)) {
    settingsStore.logger.error(logTitle, "invalid mosaic.", mosaicIdStr);
    return undefined;
  }
  const mosaicId = new MosaicId(mosaicIdStr);
  const allMosaicNames = await chainStore.namespaceRepo
    .getMosaicsNames([mosaicId])
    .toPromise();
  if (typeof allMosaicNames === "undefined") {
    settingsStore.logger.error(logTitle, "get name failed.", mosaicIdStr);
    return undefined;
  }
  const mosaicNames = allMosaicNames.find(
    (name) => name.mosaicId.toHex() === mosaicIdStr
  );
  if (typeof mosaicNames === "undefined" || mosaicNames.names.length === 0) {
    settingsStore.logger.error(logTitle, "not exist mosaic.", mosaicIdStr);
    return undefined;
  }
  return mosaicNames.names[0].name;
}
