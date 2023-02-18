import { MosaicId } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export async function getMosaicName(
  mosaicIdStr: string
): Promise<string | undefined> {
  if (undefined === environmentStore.namespaceRepo) {
    return undefined;
  }
  const mosaicId = new MosaicId(mosaicIdStr);
  const mosaicNames = await environmentStore.namespaceRepo
    .getMosaicsNames([mosaicId])
    .toPromise();
  if (undefined === mosaicNames) {
    return undefined;
  }
  const names = mosaicNames.find(
    (name) => name.mosaicId.toHex() === mosaicIdStr
  );
  if (undefined === names) {
    return undefined;
  }
  if (0 < names.names.length) {
    return names.names[0].name;
  }
  return undefined;
}
