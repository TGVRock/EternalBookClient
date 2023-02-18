import { MosaicId, MosaicInfo } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

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
