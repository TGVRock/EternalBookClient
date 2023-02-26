import type { UInt64, BlockInfo } from "symbol-sdk";
import { useEnvironmentStore } from "@/stores/environment";

const environmentStore = useEnvironmentStore();

export async function getBlockInfo(
  startHeight: UInt64
): Promise<BlockInfo | undefined> {
  if (typeof environmentStore.blockRepo === "undefined") {
    return undefined;
  }
  return environmentStore.blockRepo.getBlockByHeight(startHeight).toPromise();
}

export async function getBlockTimestamp(
  startHeight: UInt64
): Promise<number | undefined> {
  if (typeof environmentStore.blockRepo === "undefined") {
    return undefined;
  }
  const mosaicBlockInfo = await getBlockInfo(startHeight);
  if (typeof mosaicBlockInfo === "undefined") {
    return undefined;
  }
  return (
    environmentStore.epochAdjustment * 1000 +
    Number(mosaicBlockInfo?.timestamp.toString())
  );
}
