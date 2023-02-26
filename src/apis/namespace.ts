import { MosaicId } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export async function getMosaicName(
  mosaicIdStr: string
): Promise<string | undefined> {
  if (typeof environmentStore.namespaceRepo === "undefined") {
    return undefined;
  }
  const mosaicId = new MosaicId(mosaicIdStr);
  const mosaicNames = await environmentStore.namespaceRepo
    .getMosaicsNames([mosaicId])
    .toPromise();
  if (typeof mosaicNames === "undefined") {
    return undefined;
  }
  const names = mosaicNames.find(
    (name) => name.mosaicId.toHex() === mosaicIdStr
  );
  if (typeof names === "undefined") {
    return undefined;
  }
  if (0 < names.names.length) {
    return names.names[0].name;
  }
  return undefined;
}
