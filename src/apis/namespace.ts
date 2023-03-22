import type { MosaicId, MosaicNames } from "symbol-sdk";
import { useChainStore } from "@/stores/chain";
import { useSettingsStore } from "@/stores/settings";

// Stores
const settingsStore = useSettingsStore();
const chainStore = useChainStore();

/**
 * 単一モザイクのエイリアス取得
 * @param mosaicId モザイクID
 * @returns モザイクエイリアス
 */
export async function getMosaicName(
  mosaicId: MosaicId
): Promise<string | undefined> {
  const logTitle = "get mosaic name:";
  if (typeof chainStore.namespaceRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return undefined;
  }
  const allMosaicNames = await getMosaicsNames([mosaicId]);
  const mosaicNames = allMosaicNames.find((name) =>
    name.mosaicId.equals(mosaicId)
  );
  if (typeof mosaicNames === "undefined" || mosaicNames.names.length === 0) {
    settingsStore.logger.error(logTitle, "not exist mosaic.", mosaicId.toHex());
    return undefined;
  }
  return mosaicNames.names[0].name;
}

/**
 * モザイクエイリアス取得
 * @param mosaicIds 取得するモザイクIDリスト
 * @returns モザイクエイリアス
 */
export async function getMosaicsNames(
  mosaicIds: Array<MosaicId>
): Promise<MosaicNames[]> {
  const logTitle = "get mosaic name:";
  if (typeof chainStore.namespaceRepo === "undefined") {
    settingsStore.logger.error(logTitle, "repository undefined.");
    return [];
  }
  return await chainStore.namespaceRepo
    .getMosaicsNames(mosaicIds)
    .toPromise()
    .then((value) => {
      if (typeof value === "undefined") {
        settingsStore.logger.debug(logTitle, "get names undefined.");
        return [];
      }
      return value;
    })
    .catch((error) => {
      settingsStore.logger.error(logTitle, "get names failed.", error);
      return [];
    });
}
